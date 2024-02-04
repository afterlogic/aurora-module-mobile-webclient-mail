// import { useContactsStore } from '../store/index-pinia'
// const contactsStore = useContactsStore()
import notification from 'src/utils/notification'

const isShowAction = (action, message) => {
  let result = true
  if (contact) {
    switch (action) {
      case 'delete':
        break
      // case 'delete':
      //   if (Array.isArray(contact)) {
      //     if ( storage?.Id === 'all') result = false
      //   } else {
      //     if ( contact.Storage === 'team') result = false
      //   }
      //   break
      default:
        break
    }
  }
  return result
}

export const messageActions = {
  reply: {
    name: 'reply',
    displayName: 'Reply',
    icon: 'ReplyIcon',
    isShowAction: isShowAction,
    // method: () => { notification.showReport('Comming soon') },
    // component: 'SendDialog',
    routeMethod: (currentRoute) => { return currentRoute.path + '/reply' },
  },
  replyAll: {
    name: 'replyAll',
    displayName: 'Reply All',
    icon: 'ReplyIcon',
    isShowAction: isShowAction,
    // method: () => { notification.showReport('Comming soon') },
    // component: 'SendDialog',
    routeMethod: (currentRoute) => { return currentRoute.path + '/reply-all' },
  },
  forward: {
    name: 'forward',
    displayName: 'Forward',
    icon: 'ReplyIcon',
    isShowAction: isShowAction,
    // method: () => { notification.showReport('Comming soon') },
    // component: 'SendDialog',
    routeMethod: (currentRoute) => { return currentRoute.path + '/forward' },
  },
  delete: {
    name: 'delete',
    displayName: 'Delete',
    icon: 'DeleteIcon',
    isShowAction: isShowAction,
    // method: null,
    component: 'DeleteMessageDialog',
  },
  // send: {
  //   method: () => { notification.showReport('Comming soon') },
  //   name: 'send',
  //   component: 'SendDialog',
  //   displayName: 'Send',
  //   icon: 'SendIcon',
  //   isShowAction: isShowAction,
  // },
  // save: {
  //   method: null,
  //   name: 'edit',
  //   component: 'EditDialog',
  //   displayName: 'Edit',
  //   icon: 'EditIcon',
  //   isShowAction: isShowAction,
  // },
  // removeFromGroup: {
  //   method: async (group, contacts) => {
  //     return await contactsStore.asyncRemoveFromGroup({
  //       GroupUUID: group.UUID,
  //       ContactUUIDs: contacts.map(item => item.UUID)
  //     })
  //   },
  //   name: 'removeFromGroup',
  //   component: 'DeleteContactDialog',
  //   displayName: 'Remove From Group',
  //   icon: 'DeleteIcon',
  //   isShowAction: isShowAction,
  // },
}

// export const getMessageActionList = (file) => {
//   const actions = []
//   if (file) {
//     Object.keys(contactActions).forEach((key) => {
//       actions.push(contactActions[key])
//     })
//   }
//   return actions
// }
