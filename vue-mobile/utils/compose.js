import modulesManager from 'src/modules-manager'

import { useMailStore } from '../store/index-pinia'

export function isComposeAvailable() {
  return modulesManager.isModuleAvailable('MailMobileWebclient')
}

export function composeMessageToAddresses(toAddresses, router) {
  if (!isComposeAvailable() || !toAddresses || !router) {
    return false
  }

  const mailStore = useMailStore()
  mailStore.setComposeToAddresses(toAddresses)
  router.push({ name: 'message-compose' })
  return true
}

export default {
  isComposeAvailable,
  composeMessageToAddresses,
}
