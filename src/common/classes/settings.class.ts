import SettingsRepo from "../../repository/setting.repo"

export enum SettingKeys {
  HOST_DNS = 'HOST_DNS',
  PORT = 'PORT',
  BASE_URL = 'BASE_URL',
  SITE_NAME = 'SITE_NAME',
  APP_NAME = 'APP_NAME',

  SMTP_SERVER = 'SMTP_SERVER',
  SMTP_USERNAME = 'SMTP_USERNAME',
  SMTP_PASSWORD = 'SMTP_PASSWORD',
  ADMIN_EMAIL = 'ADMIN_EMAIL',
  SENDGRID_API_KEY = 'SENDGRID_API_KEY',

  TEMPL_VERIFY_EMAIL = 'TEMPL_VERIFY_EMAIL',
  TEMPL_VERIFY_EMAIL_FAILED = 'TEMPL_VERIFY_EMAIL_FAILED',
  TEMPL_VERIFY_EMAIL_SUCCESS = 'TEMPL_VERIFY_EMAIL_SUCCESS',
};

export default class Settings {

  static async siteConfigs() {
    return await Promise.all([
      Settings.siteDomain(),
      Settings.serverPort(),
      Settings.baseURL(),
      Settings.siteName(),
      Settings.appName(),
    ]);
  }

  static async appConfigs() {
    return await Promise.all([
      Settings.siteName(),
      Settings.appName(),
    ]);
  }

  static async smtpConfigs() {
    return await Promise.all([
      Settings.smtpServer(),
      Settings.smtpUsername(),
      Settings.smtpPassword(),
      Settings.adminEmail(),
      Settings.sendgridApiKey(),
    ]);
  }

  static getSync(key: string) {
    const setting: any = SettingsRepo.getSettingSync(key);
    return setting ? setting.value : '';
  }

  static async get(key: string) {
    const setting: any = await SettingsRepo.getSetting(key);
    return setting ? setting.value : '';
  }

  static async siteDomain() {
    const setting = await SettingsRepo.getSetting(SettingKeys.HOST_DNS);
    return setting ? setting.value : '';
  }

  static async serverPort() {
    const setting = await SettingsRepo.getSetting(SettingKeys.PORT);
    return setting ? setting.value : '';
  }

  static async baseURL() {
    const setting = await SettingsRepo.getSetting(SettingKeys.BASE_URL);
    return setting ? setting.value : '';
  }

  static async siteName() {
    const setting = await SettingsRepo.getSetting(SettingKeys.SITE_NAME);
    return setting ? setting.value : '';
  }

  static async appName() {
    const setting = await SettingsRepo.getSetting(SettingKeys.APP_NAME);
    return setting ? setting.value : '';
  }

  static async smtpServer() {
    const setting = await SettingsRepo.getSetting(SettingKeys.SMTP_SERVER);
    return setting ? setting.value : '';
  }

  static async smtpUsername() {
    const setting = await SettingsRepo.getSetting(SettingKeys.SMTP_USERNAME);
    return setting ? setting.value : '';
  }

  static async smtpPassword() {
    const setting = await SettingsRepo.getSetting(SettingKeys.SMTP_PASSWORD);
    return setting ? setting.value : '';
  }

  static async adminEmail() {
    const setting = await SettingsRepo.getSetting(SettingKeys.ADMIN_EMAIL);
    return setting ? setting.value : '';
  }

  static async sendgridApiKey() {
    const setting = await SettingsRepo.getSetting(SettingKeys.SENDGRID_API_KEY);
    return setting ? setting.value : '';
  }

  static async templateVerifyEmail() {
    const setting = await SettingsRepo.getSetting(SettingKeys.TEMPL_VERIFY_EMAIL);
    return setting ? setting.value : '';
  }

  static async templateVerifyEmailFailed() {
    const setting = await SettingsRepo.getSetting(SettingKeys.TEMPL_VERIFY_EMAIL_FAILED);
    return setting ? setting.value : '';
  }

  static async templateVerifyEmailSuccess() {
    const setting = await SettingsRepo.getSetting(SettingKeys.TEMPL_VERIFY_EMAIL_SUCCESS);
    return setting ? setting.value : '';
  }
}