// src/models/User.js
/**
 * User data model for authentication and authorization
 */

class User {
  constructor(data = {}) {
    this.userId = data.userId || this.generateUserId();
    this.username = data.username || "";
    this.name = data.name || "";
    this.email = data.email || "";
    this.isAdmin = data.isAdmin || false;
    this.avatar = data.avatar || null;
    this.permissions = data.permissions || this.getDefaultPermissions();
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  generateUserId() {
    const timestamp = Date.now().toString();
    return `USR${timestamp}`;
  }

  getDefaultPermissions() {
    if (this.isAdmin) {
      return {
        canCreatePlates: true,
        canEditPlates: true,
        canDeletePlates: true,
        canStartWork: true,
        canFinishWork: true,
        canLockPlates: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canExportData: true,
      };
    } else {
      // Operator permissions
      return {
        canCreatePlates: false,
        canEditPlates: true,
        canDeletePlates: false,
        canStartWork: true,
        canFinishWork: true,
        canLockPlates: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canExportData: false,
      };
    }
  }

  hasPermission(permission) {
    return this.permissions[permission] === true;
  }

  updateLastLogin() {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
    return this;
  }

  validate() {
    const errors = [];

    if (!this.username) errors.push("Username is required");
    if (!this.name) errors.push("Name is required");
    if (this.username.length < 3)
      errors.push("Username must be at least 3 characters");

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      avatar: this.avatar,
      permissions: this.permissions,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  // Return safe user data (without sensitive info)
  toSafeJSON() {
    return {
      userId: this.userId,
      username: this.username,
      name: this.name,
      isAdmin: this.isAdmin,
      avatar: this.avatar,
      permissions: this.permissions,
      lastLogin: this.lastLogin,
    };
  }

  static fromDatabase(doc) {
    return new User({
      userId: doc.userId,
      username: doc.username,
      name: doc.name,
      email: doc.email,
      isAdmin: doc.isAdmin,
      avatar: doc.avatar,
      permissions: doc.permissions,
      lastLogin: doc.lastLogin,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isActive: doc.isActive,
    });
  }
}

module.exports = User;
