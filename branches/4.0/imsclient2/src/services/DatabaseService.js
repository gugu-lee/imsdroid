import SQLite from 'react-native-sqlite-storage';

// 启用调试模式
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
  }

  // 初始化数据库
  async initDB() {
    try {
      this.database = await SQLite.openDatabase({
        name: 'ChatDB.db',
        location: 'default',
      });
      
      console.log('数据库连接成功');
      await this.createTables();
      await this.updateDatabaseSchema();
      await this.insertSampleData();
      await this.initializeDefaultSettings();
      return this.database;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  // 创建数据表
  async createTables() {
    try {
      // 创建聊天列表表
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS chat_list (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          last_message TEXT,
          last_message_time TEXT,
          unread_count INTEGER DEFAULT 0,
          avatar_url TEXT,
          is_online INTEGER DEFAULT 0,
          chat_type TEXT DEFAULT 'private',
          sip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建消息表
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chat_id INTEGER,
          message_text TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          is_my_message INTEGER DEFAULT 0,
          timestamp TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chat_id) REFERENCES chat_list (id)
        )
      `);

      // 创建用户设置表
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT,
          setting_type TEXT DEFAULT 'string',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('数据表创建成功');
    } catch (error) {
      console.error('创建数据表失败:', error);
      throw error;
    }
  }

  // 更新数据库结构（仅处理React Native端特有需求）
  // 注意：核心表结构(chat_list, messages)的升级由ChatDatabaseHelper.java的onUpgrade方法处理
  async updateDatabaseSchema() {
    try {
      // 只处理React Native端特有的表和字段
      // 避免与ChatDatabaseHelper.java中onUpgrade方法重复
      
      // 添加React Native前端特有的设置字段
      if (!(await this.columnExists('user_settings', 'description'))) {
        await this.database.executeSql(`
          ALTER TABLE user_settings ADD COLUMN description TEXT
        `);
        console.log('user_settings表description字段添加完成');
      } else {
        console.log('description字段已存在');
      }

      // 可以在这里添加其他前端特有的字段
      // 例如：UI主题、缓存设置等
      if (!(await this.columnExists('user_settings', 'ui_theme'))) {
        await this.database.executeSql(`
          ALTER TABLE user_settings ADD COLUMN ui_theme TEXT DEFAULT 'light'
        `);
        console.log('UI主题字段添加完成');
      } else {
        console.log('ui_theme字段已存在');
      }

      console.log('React Native数据库结构更新完成');
    } catch (error) {
      console.error('更新React Native数据库结构失败:', error);
      throw error;
    }
  }

  // 检查表中是否存在指定字段
  async columnExists(tableName, columnName) {
    try {
      const [results] = await this.database.executeSql(`PRAGMA table_info(${tableName})`);
      
      for (let i = 0; i < results.rows.length; i++) {
        const column = results.rows.item(i);
        if (column.name === columnName) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('检查字段存在性失败:', error);
      return false;
    }
  }

  // 插入示例数据
  async insertSampleData() {
    try {
      console.log('insertSampleData 函数调用，但业务逻辑已暂时注释');
      
      // 暂时注释掉示例数据插入逻辑
      /*
      // 检查是否已有数据
      const [results] = await this.database.executeSql('SELECT COUNT(*) as count FROM chat_list');
      const count = results.rows.item(0).count;
      
      if (count > 0) {
        console.log('数据库已有数据，跳过初始化');
        return;
      }

      // 插入示例聊天数据
      const chatData = [
        {
          name: '张三',
          lastMessage: '你好，最近怎么样？',
          time: '15:30',
          unreadCount: 2,
          avatarUrl: 'https://picsum.photos/50/50?random=1',
          isOnline: 1,
          chatType: 'private'
        },
        {
          name: '李四',
          lastMessage: '明天见面聊吧',
          time: '14:20',
          unreadCount: 0,
          avatarUrl: 'https://picsum.photos/50/50?random=2',
          isOnline: 0,
          chatType: 'private'
        },
        {
          name: '王五',
          lastMessage: '收到，谢谢！',
          time: '13:45',
          unreadCount: 1,
          avatarUrl: 'https://picsum.photos/50/50?random=3',
          isOnline: 1,
          chatType: 'private'
        },
        {
          name: '赵六',
          lastMessage: '文件已发送',
          time: '12:30',
          unreadCount: 0,
          avatarUrl: 'https://picsum.photos/50/50?random=4',
          isOnline: 0,
          chatType: 'private'
        },
        {
          name: '工作群',
          lastMessage: '钱七: 明天开会记得带资料',
          time: '11:20',
          unreadCount: 5,
          avatarUrl: 'https://picsum.photos/50/50?random=5',
          isOnline: 0,
          chatType: 'group'
        },
        {
          name: '家庭群',
          lastMessage: '妈妈: 今天晚饭想吃什么？',
          time: '10:15',
          unreadCount: 3,
          avatarUrl: 'https://picsum.photos/50/50?random=6',
          isOnline: 0,
          chatType: 'group'
        }
      ];

      for (const chat of chatData) {
        await this.database.executeSql(`
          INSERT INTO chat_list (name, last_message, last_message_time, unread_count, avatar_url, is_online, chat_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [chat.name, chat.lastMessage, chat.time, chat.unreadCount, chat.avatarUrl, chat.isOnline, chat.chatType]);
      }

      // 插入示例消息数据
      const messageData = [
        { chatId: 1, text: '你好！', isMyMessage: 0, timestamp: '10:30' },
        { chatId: 1, text: '嗨，你好！最近怎么样？', isMyMessage: 1, timestamp: '10:31' },
        { chatId: 1, text: '还不错，工作有点忙', isMyMessage: 0, timestamp: '10:32' },
        { chatId: 1, text: '理解，注意休息哦', isMyMessage: 1, timestamp: '10:33' },
        
        { chatId: 2, text: '明天几点见面？', isMyMessage: 1, timestamp: '14:18' },
        { chatId: 2, text: '下午2点怎么样？', isMyMessage: 0, timestamp: '14:19' },
        { chatId: 2, text: '明天见面聊吧', isMyMessage: 0, timestamp: '14:20' },
      ];

      for (const message of messageData) {
        await this.database.executeSql(`
          INSERT INTO messages (chat_id, message_text, is_my_message, timestamp)
          VALUES (?, ?, ?, ?)
        `, [message.chatId, message.text, message.isMyMessage, message.timestamp]);
      }

      console.log('示例数据插入成功');
      */
    } catch (error) {
      console.error('插入示例数据失败:', error);
      throw error;
    }
  }

  // 获取聊天列表
  async getChatList() {
    try {
      const [results] = await this.database.executeSql(`
        SELECT 
          id,
          name,
          last_message,
          last_message_time as time,
          unread_count,
          avatar_url as avatar,
          is_online,
          chat_type
        FROM chat_list 
        ORDER BY updated_at DESC
      `);

      const chatList = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        chatList.push({
          id: row.id.toString(),
          name: row.name,
          lastMessage: row.last_message,
          time: row.time,
          unreadCount: row.unread_count,
          avatar: row.avatar,
          isOnline: Boolean(row.is_online),
          chatType: row.chat_type
        });
      }

      return chatList;
    } catch (error) {
      console.error('获取聊天列表失败:', error);
      throw error;
    }
  }

  // 根据聊天ID获取消息列表
  async getMessagesByChatId(chatId) {
    try {
      const [results] = await this.database.executeSql(`
        SELECT 
          id,
          message_text as text,
          is_my_message,
          timestamp
        FROM messages 
        WHERE chat_id = ?
        ORDER BY created_at ASC
      `, [chatId]);

      const messages = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        messages.push({
          id: row.id.toString(),
          text: row.text,
          isMyMessage: Boolean(row.is_my_message),
          timestamp: row.timestamp
        });
      }

      return messages;
    } catch (error) {
      console.error('获取消息列表失败:', error);
      throw error;
    }
  }

  // 根据聊天名称获取聊天ID
  async getChatIdByName(chatName) {
    try {
      const [results] = await this.database.executeSql(`
        SELECT id FROM chat_list WHERE name = ?
      `, [chatName]);

      if (results.rows.length > 0) {
        return results.rows.item(0).id;
      }
      return null;
    } catch (error) {
      console.error('获取聊天ID失败:', error);
      throw error;
    }
  }

  // 根据聊天名称获取SIP地址
  async getSipAddressByName(chatName) {
    try {
      // 从数据库查询SIP地址
      const [results] = await this.database.executeSql(`
        SELECT sip_address FROM chat_list WHERE name = ?
      `, [chatName]);

      if (results.rows.length > 0) {
        const sipAddress = results.rows.item(0).sip_address;
        if (sipAddress) {
          console.log(`从数据库获取到 ${chatName} 的SIP地址: ${sipAddress}`);
          return sipAddress;
        }
      }

      // 如果数据库中没有找到SIP地址，返回null
      console.log(`数据库中未找到 ${chatName} 的SIP地址`);
      return null;
    } catch (error) {
      console.error('获取SIP地址失败:', error);
      throw error;
    }
  }

  // 更新或设置用户的SIP地址
  async updateSipAddress(chatName, sipAddress) {
    try {
      await this.database.executeSql(`
        UPDATE chat_list SET sip_address = ? WHERE name = ?
      `, [sipAddress, chatName]);
      
      console.log(`已为用户 ${chatName} 设置SIP地址: ${sipAddress}`);
      return true;
    } catch (error) {
      console.error('更新SIP地址失败:', error);
      throw error;
    }
  }

  // 添加新消息
  async addMessage(chatId, messageText, isMyMessage = true) {
    try {
      const timestamp = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await this.database.executeSql(`
        INSERT INTO messages (chat_id, message_text, is_my_message, timestamp)
        VALUES (?, ?, ?, ?)
      `, [chatId, messageText, isMyMessage ? 1 : 0, timestamp]);

      // 更新聊天列表的最后消息
      await this.database.executeSql(`
        UPDATE chat_list 
        SET last_message = ?, 
            last_message_time = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [messageText, timestamp, chatId]);

      console.log('消息添加成功');
    } catch (error) {
      console.error('添加消息失败:', error);
      throw error;
    }
  }

  // 为接收到的消息创建或更新聊天记录（用于SIP消息接收）
  async addOrUpdateChatForIncomingMessage(senderName, messageText, sipAddress = null) {
    try {
      const timestamp = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // 检查是否已存在该用户的聊天记录
      let chatId = await this.getChatIdByName(senderName);
      
      if (!chatId) {
        // 如果不存在，创建新的聊天记录
        const [result] = await this.database.executeSql(`
          INSERT INTO chat_list (name, last_message, last_message_time, unread_count, chat_type, sip_address)
          VALUES (?, ?, ?, 1, 'private', ?)
        `, [senderName, messageText, timestamp, sipAddress]);
        
        chatId = result.insertId;
        console.log(`为发送者 ${senderName} 创建新聊天记录，chatId: ${chatId}`);
      } else {
        // 如果存在，更新聊天记录
        await this.database.executeSql(`
          UPDATE chat_list 
          SET last_message = ?, 
              last_message_time = ?,
              unread_count = unread_count + 1,
              updated_at = CURRENT_TIMESTAMP,
              sip_address = COALESCE(?, sip_address)
          WHERE id = ?
        `, [messageText, timestamp, sipAddress, chatId]);
        
        console.log(`更新发送者 ${senderName} 的聊天记录，chatId: ${chatId}`);
      }

      // 添加消息到消息表
      await this.database.executeSql(`
        INSERT INTO messages (chat_id, message_text, is_my_message, timestamp)
        VALUES (?, ?, 0, ?)
      `, [chatId, messageText, timestamp]);

      console.log(`为发送者 ${senderName} 添加收到的消息: ${messageText}`);
      return chatId;
    } catch (error) {
      console.error('添加收到的消息失败:', error);
      throw error;
    }
  }

  // 搜索聊天
  async searchChats(searchText) {
    try {
      const [results] = await this.database.executeSql(`
        SELECT 
          id,
          name,
          last_message,
          last_message_time as time,
          unread_count,
          avatar_url as avatar,
          is_online,
          chat_type
        FROM chat_list 
        WHERE name LIKE ?
        ORDER BY updated_at DESC
      `, [`%${searchText}%`]);

      const chatList = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        chatList.push({
          id: row.id.toString(),
          name: row.name,
          lastMessage: row.last_message,
          time: row.time,
          unreadCount: row.unread_count,
          avatar: row.avatar,
          isOnline: Boolean(row.is_online),
          chatType: row.chat_type
        });
      }

      return chatList;
    } catch (error) {
      console.error('搜索聊天失败:', error);
      throw error;
    }
  }

  // 删除聊天记录
  async deleteChat(chatId) {
    try {
      // 开始事务
      await this.database.executeSql('BEGIN TRANSACTION');
      
      // 删除该聊天的所有消息
      await this.database.executeSql(`
        DELETE FROM messages WHERE chat_id = ?
      `, [chatId]);
      
      // 删除聊天列表项
      await this.database.executeSql(`
        DELETE FROM chat_list WHERE id = ?
      `, [chatId]);
      
      // 提交事务
      await this.database.executeSql('COMMIT');
      
      console.log(`聊天记录 ${chatId} 删除成功`);
      return true;
    } catch (error) {
      // 回滚事务
      await this.database.executeSql('ROLLBACK');
      console.error('删除聊天记录失败:', error);
      throw error;
    }
  }

  // 批量删除聊天记录
  async deleteChatsBatch(chatIds) {
    try {
      await this.database.executeSql('BEGIN TRANSACTION');
      
      for (const chatId of chatIds) {
        // 删除消息
        await this.database.executeSql(`
          DELETE FROM messages WHERE chat_id = ?
        `, [chatId]);
        
        // 删除聊天列表项
        await this.database.executeSql(`
          DELETE FROM chat_list WHERE id = ?
        `, [chatId]);
      }
      
      await this.database.executeSql('COMMIT');
      console.log(`批量删除聊天记录成功: ${chatIds.join(', ')}`);
      return true;
    } catch (error) {
      await this.database.executeSql('ROLLBACK');
      console.error('批量删除聊天记录失败:', error);
      throw error;
    }
  }

  // 清空聊天消息但保留聊天列表
  async clearChatMessages(chatId) {
    try {
      await this.database.executeSql(`
        DELETE FROM messages WHERE chat_id = ?
      `, [chatId]);
      
      // 更新聊天列表，清空最后消息
      await this.database.executeSql(`
        UPDATE chat_list 
        SET last_message = '', 
            last_message_time = '',
            unread_count = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [chatId]);
      
      console.log(`聊天 ${chatId} 的消息清空成功`);
      return true;
    } catch (error) {
      console.error('清空聊天消息失败:', error);
      throw error;
    }
  }

  // ================== 用户设置相关方法 ==================
  
  // 保存或更新用户设置
  async saveSetting(key, value, type = 'string') {
    try {
      await this.database.executeSql(`
        INSERT OR REPLACE INTO user_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [key, JSON.stringify(value), type]);
      
      console.log(`设置保存成功: ${key} = ${value}`);
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }

  // 获取用户设置
  async getSetting(key, defaultValue = null) {
    try {
      const [results] = await this.database.executeSql(`
        SELECT setting_value, setting_type FROM user_settings WHERE setting_key = ?
      `, [key]);
      
      if (results.rows.length > 0) {
        const item = results.rows.item(0);
        try {
          return JSON.parse(item.setting_value);
        } catch (parseError) {
          // 如果解析失败，返回原始字符串
          return item.setting_value;
        }
      }
      
      return defaultValue;
    } catch (error) {
      console.error('获取设置失败:', error);
      return defaultValue;
    }
  }

  // 获取所有用户设置
  async getAllSettings() {
    try {
      const [results] = await this.database.executeSql(`
        SELECT setting_key, setting_value, setting_type FROM user_settings
      `);
      
      const settings = {};
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        try {
          settings[item.setting_key] = JSON.parse(item.setting_value);
        } catch (parseError) {
          settings[item.setting_key] = item.setting_value;
        }
      }
      
      return settings;
    } catch (error) {
      console.error('获取所有设置失败:', error);
      return {};
    }
  }

  // 删除用户设置
  async deleteSetting(key) {
    try {
      await this.database.executeSql(`
        DELETE FROM user_settings WHERE setting_key = ?
      `, [key]);
      
      console.log(`设置删除成功: ${key}`);
      return true;
    } catch (error) {
      console.error('删除设置失败:', error);
      throw error;
    }
  }

  // 批量保存设置
  async saveMultipleSettings(settings) {
    try {
      await this.database.executeSql('BEGIN TRANSACTION');
      
      for (const [key, value] of Object.entries(settings)) {
        await this.database.executeSql(`
          INSERT OR REPLACE INTO user_settings (setting_key, setting_value, setting_type, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [key, JSON.stringify(value), typeof value]);
      }
      
      await this.database.executeSql('COMMIT');
      console.log('批量保存设置成功');
      return true;
    } catch (error) {
      await this.database.executeSql('ROLLBACK');
      console.error('批量保存设置失败:', error);
      throw error;
    }
  }

  // 初始化默认设置
  async initializeDefaultSettings() {
    try {
      const defaultSettings = {
        // 个人信息设置
        'profile.nickname': '用户名称',
        'profile.signature': '这个人很懒，什么都没留下',
        'profile.avatar': 'https://via.placeholder.com/60',
        'profile.gender': '未设置',
        'profile.region': '未设置',
        
        // 账号设置
        'account.sipAddress': '',
        'account.password': '',
        'account.autoLogin': false,
        'account.rememberPassword': false,
        'account.showOnlineStatus': true,
        
        // 服务器设置
        'server.pcscfAddress': '',
        'server.port': '5060',
        'server.useSSL': false,
        'server.registrationTimeout': '3600',
        'server.keepAliveInterval': '30',
        'server.preset': 'custom',
        
        // 应用设置
        'app.language': 'zh-CN',
        'app.theme': 'light',
        'app.fontSize': 'medium',
        'app.autoDownloadImages': true,
        'app.soundEnabled': true,
        'app.vibrationEnabled': true,
        'app.showTimestamp': true,
        
        // 隐私设置
        'privacy.readReceipts': true,
        'privacy.typingIndicator': true,
        'privacy.lastSeenVisible': true,
        'privacy.profilePhotoVisible': true,
      };

      // 检查是否已经初始化过
      const isInitialized = await this.getSetting('app.initialized', false);
      if (isInitialized) {
        console.log('默认设置已初始化，跳过');
        return;
      }

      // 保存默认设置
      await this.saveMultipleSettings(defaultSettings);
      await this.saveSetting('app.initialized', true, 'boolean');
      
      console.log('默认设置初始化完成');
    } catch (error) {
      console.error('初始化默认设置失败:', error);
      throw error;
    }
  }

  // 获取调试信息
  async getDebugInfo() {
    try {
      if (!this.database) {
        return {
          status: 'disconnected',
          error: '数据库未连接'
        };
      }

      const debugInfo = {
        status: 'connected',
        databaseName: 'ChatDB.db',
        tables: {},
        settings: {},
        lastInitialized: await this.getSetting('app.initialized', false),
      };

      // 检查各个表的信息
      const tableNames = ['chat_list', 'messages', 'user_settings'];
      
      for (const tableName of tableNames) {
        try {
          // 检查表是否存在
          const tableExistsResult = await this.database.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            [tableName]
          );
          
          const tableExists = tableExistsResult[0].rows.length > 0;
          debugInfo.tables[tableName] = { exists: tableExists };
          
          if (tableExists) {
            // 获取记录数
            const countResult = await this.database.executeSql(
              `SELECT COUNT(*) as count FROM ${tableName}`
            );
            debugInfo.tables[tableName].count = countResult[0].rows.item(0).count;
            
            // 对于user_settings表，获取所有设置键
            if (tableName === 'user_settings') {
              const settingsResult = await this.database.executeSql(
                'SELECT setting_key, setting_type FROM user_settings ORDER BY setting_key'
              );
              
              debugInfo.tables[tableName].keys = [];
              for (let i = 0; i < settingsResult[0].rows.length; i++) {
                const row = settingsResult[0].rows.item(i);
                debugInfo.tables[tableName].keys.push({
                  key: row.setting_key,
                  type: row.setting_type
                });
              }
            }
          }
        } catch (tableError) {
          debugInfo.tables[tableName] = { 
            exists: false, 
            error: tableError.message 
          };
        }
      }

      // 获取关键设置值
      const keySettings = [
        'account.sipAddress',
        'account.autoLogin',
        'server.pcscfAddress',
        'server.port',
        'server.useSSL',
        'profile.nickname',
        'app.language',
        'app.theme'
      ];

      for (const key of keySettings) {
        try {
          const value = await this.getSetting(key, null);
          debugInfo.settings[key] = {
            value: value,
            hasValue: value !== null && value !== undefined && value !== ''
          };
        } catch (settingError) {
          debugInfo.settings[key] = {
            error: settingError.message
          };
        }
      }

      return debugInfo;
    } catch (error) {
      console.error('获取调试信息失败:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // 清空所有设置
  async clearAllSettings() {
    try {
      if (!this.database) {
        throw new Error('数据库未连接');
      }

      await this.database.executeSql('DELETE FROM user_settings');
      console.log('所有设置已清空');
      
      // 重新初始化默认设置
      await this.initializeDefaultSettings();
      
      return true;
    } catch (error) {
      console.error('清空设置失败:', error);
      throw error;
    }
  }

  // 关闭数据库连接
  async closeDB() {
    if (this.database) {
      await this.database.close();
      console.log('数据库连接已关闭');
    }
  }
}

// 创建单例实例
const databaseService = new DatabaseService();

export default databaseService;
export { databaseService as DatabaseService };
