
const Paths = {
    Users: {
      Base: "/api/user", 
    },
    Auth: {
        Signup: "/api/signup",
        login: "/api/login",
    },
     Member: {
        add: "/api/add-member",
        loyalMemberAdd: "/api/add-loyal-members",
        list : "/api/members",
        edit : '/api/member/:id',
        download : '/api/download-members',
    },
    Promotion: {
        add: "/api/add-promotion",
        list : "/api/promotions",
        lastSentPromotion : "/api/last-promotion",
        audienceList : "/api/get-audience",
    },
    Announcement: {
        add: "/api/add-announcement",
        list : "/api/announcements",
    },
    
  };

  export default Paths;