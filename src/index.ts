import express from "express";
import cors from "cors";
import router from "./router";
import env from "./common/middlewares/env.middleware";

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

const options: cors.CorsOptions = {
  origin: "*"
};

const app = express();
app.use(env);
app.use(express.json({ limit: "8mb" }));
app.use(cors(options));
app.use(router);

if (process.env.FLUTTER_PROXY) {
  const httpProxy = require('http-proxy');
  const proxy = httpProxy.createProxyServer({});

  const proxyPass = (req: any, res: any) => {
    req.url = req.url.replace('/flutter', '/');
    return proxy.web(req, res,
      { target: process.env.FLUTTER_PROXY },
      (e: any) => console.warn('proxy', e));
  };

  app.get('/flutter', proxyPass);
  app.get('/assets*', proxyPass);
  app.get('/icons*', proxyPass);
  app.get('/favicon.ico', proxyPass);
  app.get('/main.dart.js', proxyPass);
  app.get('/manifest.json', proxyPass);
}

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
