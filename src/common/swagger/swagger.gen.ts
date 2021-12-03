import { writeFile } from "fs";
import StringUtils from "../utils/string.util";

export default class SwaggerGen {
  template = {
    openapi: "3.0.2",
    info: {
      version: "1.0.2",
      title: `${process.env.APP_NAME}`,
      description: "A robust and concrete API framework",
      license: {
        name: "Netpower@2020",
        url: "https://www.netpower.vn/",
      },
    },
    servers: [
      {
        url: `http://${process.env.HOST_DNS}:${process.env.PORT}`,
        description: "Development APIs",
      },
    ],
    paths: [],
    tags: [],
    components: {
      securitySchemes: {
        jwtBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };

  static genSwaggerJson(routes: Array<any>) {
    const tags: any = [];
    const paths: any = {};

    routes.map((route) => {
      const [prefix, method, path, callback, parameters] = route;

      const tagGroup = prefix && prefix.split('/').length > 1 ?
        StringUtils.toCamelCase(prefix.replace(/[^\/]+\//, '')) + ' - ' : '';
      const tag = tagGroup + StringUtils.upperCaseFirstLetter(
        path.toString().replace(prefix, '').split("/")[2]
      );
      if (tags.indexOf(tag) < 0) tags.push(tag);

      const path2Route = path.replace(/\/:([^\/]+)/g, "/{$1}");
      if (!paths[path2Route]) paths[path2Route] = {};

      const queries: any = [];
      const body: any = {};
      const encoding: any = {};
      const hasFile =
        parameters &&
        !!Object.keys(parameters).find((k) => {
          const param = parameters[k];
          return param.type == "file"
            || (param.type == "array" && param.items && param.items.type == "file")
        });
      const jwt =
        parameters && !!Object.keys(parameters).find((k) => k == "jwt");

      const parseClassProps = (props: any, classFunc: any) => {
        const data = new classFunc();
        Object.keys(data).map((k: string) => {
          if (Array.isArray(data[k])) {
            props[k] = {
              type: "array",
              items: { type: "string" },
            };
          } else if (typeof data[k] == "function") {
            const properties = {};
            parseClassProps(properties, data[k]);
            props[k] = {
              type: "object",
              properties,
            };
          } else {
            props[k] = { type: typeof data[k] };
          }
        });
      };

      const parseParam = (param: any) => {
        let schema: any = {};
        if (param.enum) {
          schema = {
            type: param.type || "string",
            enum: Array.isArray(param.enum)
              ? param.enum
              : Object.keys(param.enum),
          };
        } else if (param.type == "object") {
          const props: any = {};
          const requiredProps: any = [];

          if (param.props) {
            if (Array.isArray(param.props)) {
              param.props.map((k: string) => (props[k] = { type: "string" }));
            } else if (typeof param.props == "function") {
              parseClassProps(props, param.props);
            } else {
              Object.keys(param.props).map((k: string) => {
                props[k] = parseParam(param.props[k]);
                if (props[k].required) requiredProps.push(k);
              });
            }
          }
          schema = {
            type: param.type,
            properties: props,
            required: requiredProps,
          };
        } else if (param.type == "array") {
          schema = {
            type: param.type,
            items: parseParam(param.items || {}),
            required: !!param.required,
            explode: true,
          };
        } else if (param.type == "file") {
          schema = {
            type: "string",
            format: "binary",
            required: !!param.required,
          };
        } else {
          schema = {
            type: param.type || "string",
            required: !!param.required,
          };
        }

        return schema;
      };

      parameters &&
        Object.keys(parameters).map((name: any) => {
          if (name == "jwt") return;

          const param = parameters[name];

          if (param.type == "file" || !param.in || param.in == "body"
            || (param.type == "array" && param.items && param.items.type == "file")) {
            body[name] = parseParam(param);
            if (body[name].explode) {
              encoding[name] = { explode: true };
            }
          } else {
            const schema = parseParam(param);
            const query: any = {
              ...param,
              name,
              in: param.in,
              description: param.desc || "",
              required: param.required,
              schema,
            };
            queries.push(query);
          }
        });

      const bodySchema = {
        schema: {
          type: "object",
          properties: body,
        },
        encoding,
      };

      paths[path2Route][method] = {
        tags: [tag],
        parameters: queries,
        requestBody: {
          content: {
            "multipart/form-data": bodySchema,
            "application/json": bodySchema,
          },
        },
        responses: {},
        security: jwt ? [{ jwtBearer: [] }] : null,
      };

      if (Object.keys(body).length == 0) {
        delete paths[path2Route][method]["requestBody"];
      } else if (hasFile) {
        // file upload via multipart not application/json
        delete paths[path2Route][method]["requestBody"]["content"][
          "application/json"
        ];
      }
    });

    const generator = new SwaggerGen();
    generator.template.tags = tags;
    generator.template.paths = paths;

    writeFile("swagger.json", JSON.stringify(generator.template), () => { });
  }
}
