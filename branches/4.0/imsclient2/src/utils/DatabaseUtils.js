import databaseService from '../services/DatabaseService';

/**
 * 应用启动时初始化数据库
 */
export const initializeApp = async () => {
  try {
    console.log('开始初始化应用...');
    await databaseService.initDB();
    console.log('应用初始化完成');
    return true;
  } catch (error) {
    console.error('应用初始化失败:', error);
    return false;
  }
};

/**
 * 添加新的聊天对话
 */
export const addNewChat = async (name, avatar, chatType = 'private') => {
  try {
    await databaseService.database.executeSql(`
      INSERT INTO chat_list (name, last_message, last_message_time, avatar_url, chat_type)
      VALUES (?, ?, ?, ?, ?)
    `, [name, '', new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), avatar, chatType]);
    return true;
  } catch (error) {
    console.error('添加聊天失败:', error);
    return false;
  }
};

/**
 * 删除聊天对话
 */
export const deleteChat = async (chatId) => {
  try {
    // 删除聊天记录
    await databaseService.database.executeSql('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    // 删除聊天列表项
    await databaseService.database.executeSql('DELETE FROM chat_list WHERE id = ?', [chatId]);
    return true;
  } catch (error) {
    console.error('删除聊天失败:', error);
    return false;
  }
};

/**
 * 清除未读消息数量
 */
export const clearUnreadCount = async (chatId) => {
  try {
    await databaseService.database.executeSql(
      'UPDATE chat_list SET unread_count = 0 WHERE id = ?',
      [chatId]
    );
    return true;
  } catch (error) {
    console.error('清除未读消息失败:', error);
    return false;
  }
};

/**
 * 备份数据库数据到JSON
 */
export const exportChatData = async () => {
  try {
    const chatList = await databaseService.getChatList();
    const exportData = {
      chatList,
      messages: {}
    };

    // 获取每个聊天的消息
    for (const chat of chatList) {
      const messages = await databaseService.getMessagesByChatId(parseInt(chat.id));
      exportData.messages[chat.id] = messages;
    }

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('导出数据失败:', error);
    return null;
  }
};

/**
 * 从JSON导入数据到数据库
 */
export const importChatData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // 清空现有数据
    await databaseService.database.executeSql('DELETE FROM messages');
    await databaseService.database.executeSql('DELETE FROM chat_list');
    
    // 导入聊天列表
    for (const chat of data.chatList) {
      await databaseService.database.executeSql(`
        INSERT INTO chat_list (name, last_message, last_message_time, unread_count, avatar_url, is_online, chat_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [chat.name, chat.lastMessage, chat.time, chat.unreadCount, chat.avatar, chat.isOnline ? 1 : 0, chat.chatType]);
    }
    
    // 导入消息
    for (const chatId in data.messages) {
      const messages = data.messages[chatId];
      for (const message of messages) {
        await databaseService.database.executeSql(`
          INSERT INTO messages (chat_id, message_text, is_my_message, timestamp)
          VALUES (?, ?, ?, ?)
        `, [parseInt(chatId), message.text, message.isMyMessage ? 1 : 0, message.timestamp]);
      }
    }
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};
