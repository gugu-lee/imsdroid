import DatabaseService from './DatabaseService';

class FriendService {
  constructor() {
    this.db = null;
  }

  async initDatabase() {
    if (!this.db) {
      await DatabaseService.initDB();
      this.db = DatabaseService.database;
    }
  }

  // 获取所有好友列表
  async getAllFriends() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `SELECT f.*, 
             CASE 
               WHEN p.status = 'online' THEN 'online'
               WHEN p.status = 'away' THEN 'away'
               WHEN p.status = 'busy' THEN 'busy'
               ELSE 'offline'
             END as onlineStatus,
             p.statusMessage
             FROM friends f 
             LEFT JOIN presence p ON f.sipAddress = p.sipAddress 
             ORDER BY f.displayName ASC`,
            [],
            (_, result) => {
              const friends = [];
              for (let i = 0; i < result.rows.length; i++) {
                friends.push(result.rows.item(i));
              }
              resolve(friends);
            },
            (_, error) => {
              console.error('获取好友列表失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('获取好友列表失败:', error);
      throw error;
    }
  }

  // 根据ID获取好友信息
  async getFriendById(friendId) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `SELECT f.*, 
             CASE 
               WHEN p.status = 'online' THEN 'online'
               WHEN p.status = 'away' THEN 'away'
               WHEN p.status = 'busy' THEN 'busy'
               ELSE 'offline'
             END as onlineStatus,
             p.statusMessage
             FROM friends f 
             LEFT JOIN presence p ON f.sipAddress = p.sipAddress 
             WHERE f.id = ?`,
            [friendId],
            (_, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.item(0));
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('获取好友信息失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('获取好友信息失败:', error);
      throw error;
    }
  }

  // 根据SIP地址获取好友信息
  async getFriendBySipAddress(sipAddress) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM friends WHERE sipAddress = ?',
            [sipAddress],
            (_, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.item(0));
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('获取好友信息失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('获取好友信息失败:', error);
      throw error;
    }
  }

  // 添加好友
  async addFriend(friendData) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const {
        sipAddress,
        displayName,
        nickname = '',
        avatar = '',
        remark = '',
        group = 'default',
        phone = '',
        email = '',
      } = friendData;

      // 验证必要字段
      if (!sipAddress || !displayName) {
        throw new Error('SIP地址和显示名称不能为空');
      }

      // 检查是否已存在
      const existingFriend = await this.getFriendBySipAddress(sipAddress);
      if (existingFriend) {
        throw new Error('该好友已存在');
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO friends (
              sipAddress, displayName, nickname, avatar, remark, 
              groupName, phone, email, status, addTime
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'normal', datetime('now', 'localtime'))`,
            [sipAddress, displayName, nickname, avatar, remark, group, phone, email],
            (_, result) => {
              resolve({
                id: result.insertId,
                sipAddress,
                displayName,
                nickname,
                avatar,
                remark,
                groupName: group,
                phone,
                email,
                status: 'normal',
                addTime: new Date().toISOString(),
              });
            },
            (_, error) => {
              console.error('添加好友失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('添加好友失败:', error);
      throw error;
    }
  }

  // 更新好友信息
  async updateFriend(friendId, updateData) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const {
        displayName,
        nickname,
        avatar,
        remark,
        groupName,
        phone,
        email,
      } = updateData;

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `UPDATE friends SET 
             displayName = ?, nickname = ?, avatar = ?, remark = ?, 
             groupName = ?, phone = ?, email = ?, updateTime = datetime('now', 'localtime')
             WHERE id = ?`,
            [displayName, nickname, avatar, remark, groupName, phone, email, friendId],
            (_, result) => {
              if (result.rowsAffected > 0) {
                resolve(true);
              } else {
                reject(new Error('更新失败，好友不存在'));
              }
            },
            (_, error) => {
              console.error('更新好友信息失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('更新好友信息失败:', error);
      throw error;
    }
  }

  // 删除好友
  async deleteFriend(friendId) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          // 同时删除相关的聊天记录
          tx.executeSql(
            'DELETE FROM messages WHERE friendId = ?',
            [friendId],
            () => {
              tx.executeSql(
                'DELETE FROM friends WHERE id = ?',
                [friendId],
                (_, result) => {
                  if (result.rowsAffected > 0) {
                    resolve(true);
                  } else {
                    reject(new Error('删除失败，好友不存在'));
                  }
                },
                (_, error) => {
                  console.error('删除好友失败:', error);
                  reject(error);
                }
              );
            },
            (_, error) => {
              console.error('删除聊天记录失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('删除好友失败:', error);
      throw error;
    }
  }

  // 搜索好友
  async searchFriends(keyword) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      if (!keyword || keyword.trim() === '') {
        return this.getAllFriends();
      }

      const searchTerm = `%${keyword.trim()}%`;

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `SELECT f.*, 
             CASE 
               WHEN p.status = 'online' THEN 'online'
               WHEN p.status = 'away' THEN 'away'
               WHEN p.status = 'busy' THEN 'busy'
               ELSE 'offline'
             END as onlineStatus,
             p.statusMessage
             FROM friends f 
             LEFT JOIN presence p ON f.sipAddress = p.sipAddress 
             WHERE f.displayName LIKE ? OR f.nickname LIKE ? OR f.sipAddress LIKE ? OR f.remark LIKE ?
             ORDER BY f.displayName ASC`,
            [searchTerm, searchTerm, searchTerm, searchTerm],
            (_, result) => {
              const friends = [];
              for (let i = 0; i < result.rows.length; i++) {
                friends.push(result.rows.item(i));
              }
              resolve(friends);
            },
            (_, error) => {
              console.error('搜索好友失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('搜索好友失败:', error);
      throw error;
    }
  }

  // 获取好友分组列表
  async getFriendGroups() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `SELECT groupName, COUNT(*) as friendCount 
             FROM friends 
             WHERE status = 'normal' 
             GROUP BY groupName 
             ORDER BY groupName ASC`,
            [],
            (_, result) => {
              const groups = [];
              for (let i = 0; i < result.rows.length; i++) {
                groups.push(result.rows.item(i));
              }
              resolve(groups);
            },
            (_, error) => {
              console.error('获取好友分组失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('获取好友分组失败:', error);
      throw error;
    }
  }

  // 按分组获取好友
  async getFriendsByGroup(groupName) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      return new Promise((resolve, reject) => {
        this.db.transaction(tx => {
          tx.executeSql(
            `SELECT f.*, 
             CASE 
               WHEN p.status = 'online' THEN 'online'
               WHEN p.status = 'away' THEN 'away'
               WHEN p.status = 'busy' THEN 'busy'
               ELSE 'offline'
             END as onlineStatus,
             p.statusMessage
             FROM friends f 
             LEFT JOIN presence p ON f.sipAddress = p.sipAddress 
             WHERE f.groupName = ? AND f.status = 'normal'
             ORDER BY f.displayName ASC`,
            [groupName],
            (_, result) => {
              const friends = [];
              for (let i = 0; i < result.rows.length; i++) {
                friends.push(result.rows.item(i));
              }
              resolve(friends);
            },
            (_, error) => {
              console.error('获取分组好友失败:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('获取分组好友失败:', error);
      throw error;
    }
  }
}

export default new FriendService();
