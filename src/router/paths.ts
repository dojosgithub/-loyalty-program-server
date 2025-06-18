
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
    },
    
  };

  export default Paths;