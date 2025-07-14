const Paths = {
  Users: {
    Base: "/api/user",
  },
  Auth: {
    sendTOTP: "/api/send-totp",
    verifyTOTP: "/api/verify-totp",
    sendSMS: "/api/send-sms",
  },
  Member: {
    add: "/api/add-member",
    MemberPointAdd: "/api/add-member-points",
    list: "/api/members",
    pointEdit: "/api/member/:id",
    edit: "/api/update-member/:id",
    download: "/api/download-members",
    getPoints: "/api/get-points",
    redeem : "/api/redeem-points",
  },
  Promotion: {
    add: "/api/add-promotion",
    list: "/api/promotions",
    lastSentPromotion: "/api/last-promotion",
    audienceList: "/api/get-audience",
  },
  Announcement: {
    add: "/api/add-announcement",
    list: "/api/announcements",
  },
  Reward: {
    add: "/api/add-reward",
    list: "/api/rewards",
    edit: "/api/reward/:id",
    delete: "/api/reward/:id",
// public routes
    getAllRewards: "/api/get-rewards",
  },
  Activity: {
    list: "/api/activity",
  },
};

export default Paths;
