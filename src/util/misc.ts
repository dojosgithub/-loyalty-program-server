export function tick(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }

  export const getLoginLinkByEnv = () => {
    return process.env.CLOUD === 'DEV_CLOUD' ? process.env.DOMAIN_FRONT_DEV : process.env.DOMAIN_PROD
  }