

const rolePermissions = {
    admin: {
      canViewManageInventory: true,
      canViewManageMedia: true,
      canViewBrowseMedia: true,
    },
    user: {
      canViewManageInventory: false,
      canViewManageMedia: true,
      canViewBrowseMedia: true,
    },
    guest: {
      canViewManageInventory: false,
      canViewManageMedia: false,
      canViewBrowseMedia: true,
    },
  };
  
  export default rolePermissions;