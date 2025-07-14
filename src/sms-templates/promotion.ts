export const promotions = function ({ description, message, expdate }: any) {
  return `
Albaraka Market: ${description}

 ${message}

 Reply YES to save.
📅 Expiry Date: ${expdate}
  `;
};
