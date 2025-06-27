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


  export const PROMOTION_STATUS = {
    DRAFT : "Draft",
    SENT: "Sent",
    SCHEDULED : "Scheduled",
    FAILED: "Failed",
  }

  export const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts;
  const isoString = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;

  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};