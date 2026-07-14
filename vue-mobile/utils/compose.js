import modulesManager from 'src/modules-manager'
import webApi from 'src/api/web-api'

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

export function composeMessageWithAttachments(attachments, router) {
  if (!isComposeAvailable() || !attachments?.length || !router) {
    return false
  }

  const mailStore = useMailStore()
  mailStore.setComposeAttachments(attachments)
  router.push({ name: 'message-compose' })
  return true
}

export function composeMessageWithData({ to, subject, body, isHtml = true }, router) {
  if (!isComposeAvailable() || !router || !to) {
    return false
  }

  const mailStore = useMailStore()
  mailStore.setComposeToAddresses(to)

  if (subject) {
    mailStore.setComposeSubject(subject)
  }

  if (body) {
    mailStore.setComposeBody(body)
    mailStore.setComposeIsHtml(isHtml)
  }

  router.push({ name: 'message-compose' })
  return true
}

export async function composeMessageWithAttachmentContent({ content, fileName, router }) {
  if (!isComposeAvailable() || !content || !fileName || !router) {
    return false
  }

  const fileItem = await webApi.sendRequest({
    moduleName: 'Core',
    methodName: 'SaveContentAsTempFile',
    parameters: {
      Content: content,
      FileName: fileName,
    },
  })

  if (!fileItem?.TempName) {
    return false
  }

  return composeMessageWithAttachments([{
    tempName: fileItem.TempName,
    filename: fileItem.Name || fileName,
  }], router)
}

export default {
  isComposeAvailable,
  composeMessageToAddresses,
  composeMessageWithAttachments,
  composeMessageWithData,
  composeMessageWithAttachmentContent,
}
