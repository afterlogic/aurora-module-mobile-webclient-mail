import { getApiHost } from 'src/api/helpers'
import types from 'src/utils/types'

function normalizeCid(cid) {
  return types.pString(cid).replace(/^<|>$/g, '').trim()
}

function buildAttachmentList(attachments) {
  const collection = attachments?.['@Collection']
  if (!Array.isArray(collection)) {
    return []
  }

  return collection.map((item) => ({
    CID: normalizeCid(item.CID),
    ContentLocation: types.pString(item.ContentLocation),
    ViewLink: types.pString(item.Actions?.view?.url),
  }))
}

function findAttachmentByCid(attachmentList, cid) {
  const normalizedCid = normalizeCid(cid)
  return attachmentList.find((item) => item.CID === normalizedCid) || null
}

function findAttachmentByContentLocation(attachmentList, contentLocation) {
  return attachmentList.find((item) => item.ContentLocation === contentLocation) || null
}

function extractImgAttributeFromHtml(html, cid, attributeName) {
  const normalizedCid = normalizeCid(cid)
  if (!normalizedCid || !html) {
    return ''
  }

  const tagPattern = new RegExp(
    '<img[^>]*data-x-src-cid=["\']' + normalizedCid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'][^>]*>',
    'i'
  )
  const tagMatch = html.match(tagPattern)
  if (!tagMatch) {
    return ''
  }

  const attributePattern = new RegExp('\\s' + attributeName + '=["\']([^"\']+)["\']', 'i')
  const attributeMatch = tagMatch[0].match(attributePattern)
  return attributeMatch ? attributeMatch[1] : ''
}

function extractMailAttachmentPath(url) {
  const src = types.pString(url).trim().replace(/&amp;/g, '&')
  const match = src.match(/\?mail-attachments-cookieless\/[^\s"'#&]+/i)
    || src.match(/\?mail-attachment\/[^\s"'#&]+/i)
    || src.match(/mail-attachments-cookieless\/[^\s"'#&]+/i)
    || src.match(/mail-attachment\/[^\s"'#&]+/i)

  if (!match) {
    return ''
  }

  let path = match[0]
  if (!path.startsWith('?')) {
    path = '?' + path
  }

  return path
    .replace(/mail-attachments-cookieless\//g, 'mail-attachment/')
    .replace(/([?&])AuthToken=[^&]*/gi, '')
    .replace(/[?&]$/, '')
}

function toAbsoluteMailAttachmentUrl(path) {
  const apiHost = getApiHost().replace(/\/$/, '')
  const cleanPath = path.replace(/^\?/, '')
  return `${apiHost}/?${cleanPath}`
}

/**
 * Resolves a mail attachment URL for img src (same-origin cookie auth, like desktop).
 *
 * @param {string} url
 * @return {string}
 */
function resolveImageUrl(url) {
  const src = types.pString(url).trim().replace(/&amp;/g, '&')
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  if (/^cid:/i.test(src)) {
    return ''
  }

  const mailAttachmentPath = extractMailAttachmentPath(src)
  if (mailAttachmentPath) {
    return toAbsoluteMailAttachmentUrl(mailAttachmentPath)
  }

  if (/^https?:\/\//i.test(src)) {
    return src
  }

  let path = src
  if (path.startsWith('./')) {
    path = path.substring(1)
  }

  return getApiHost() + path
}

function resolveUrlInCssValue(value) {
  return value.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, url) => {
    const resolved = resolveImageUrl(url.trim())
    return resolved !== url.trim() ? `url('${resolved}')` : match
  })
}

function setImgSrc(element, url) {
  const resolved = resolveImageUrl(url)
  if (resolved) {
    element.setAttribute('src', resolved)
  }
}

function resolveCidImage(element, attachmentList, sourceHtml) {
  const cid = element.getAttribute('data-x-src-cid')
  if (!cid) {
    return
  }

  const attachment = findAttachmentByCid(attachmentList, cid)
  if (attachment?.ViewLink) {
    setImgSrc(element, attachment.ViewLink)
    return
  }

  const currentSrc = types.pString(element.getAttribute('src')).trim()
  if (currentSrc && !/^cid:/i.test(currentSrc)) {
    if (/mail-attachment/i.test(currentSrc)) {
      setImgSrc(element, currentSrc)
    }
    return
  }

  const brokenSrc = element.getAttribute('data-x-broken-src')
  if (brokenSrc) {
    setImgSrc(element, brokenSrc)
    return
  }

  const srcFromSourceHtml = extractImgAttributeFromHtml(sourceHtml, cid, 'src')
  if (srcFromSourceHtml) {
    setImgSrc(element, srcFromSourceHtml)
    return
  }

  const brokenSrcFromSourceHtml = extractImgAttributeFromHtml(sourceHtml, cid, 'data-x-broken-src')
  if (brokenSrcFromSourceHtml) {
    setImgSrc(element, brokenSrcFromSourceHtml)
  }
}

function resolveInlineImages(root, attachmentList, sourceHtml) {
  root.querySelectorAll('[data-x-src-cid]').forEach((element) => {
    resolveCidImage(element, attachmentList, sourceHtml)
  })

  root.querySelectorAll('[data-x-style-cid]').forEach((element) => {
    const styleName = element.getAttribute('data-x-style-cid-name')
    const cid = element.getAttribute('data-x-style-cid')
    const attachment = findAttachmentByCid(attachmentList, cid)
    if (attachment?.ViewLink && styleName) {
      let style = (element.getAttribute('style') || '').trim()
      style = style === '' ? '' : (style.endsWith(';') ? style + ' ' : style + '; ')
      element.setAttribute('style', style + styleName + ": url('" + resolveImageUrl(attachment.ViewLink) + "')")
    }
  })

  root.querySelectorAll('[data-x-src-location]').forEach((element) => {
    const location = element.getAttribute('data-x-src-location')
    let attachment = findAttachmentByContentLocation(attachmentList, location)
    if (!attachment) {
      attachment = findAttachmentByCid(attachmentList, location)
    }
    if (attachment?.ViewLink) {
      setImgSrc(element, attachment.ViewLink)
    }
  })
}

function resolveImgSrcAttributes(root, attachmentList) {
  root.querySelectorAll('img[src]').forEach((element) => {
    let src = types.pString(element.getAttribute('src')).trim()
    if (/^cid:/i.test(src)) {
      const attachment = findAttachmentByCid(attachmentList, src.substring(4))
      if (attachment?.ViewLink) {
        setImgSrc(element, attachment.ViewLink)
      }
      return
    }

    const resolved = resolveImageUrl(src)
    if (resolved && resolved !== src) {
      element.setAttribute('src', resolved)
    }
  })

  root.querySelectorAll('img[data-x-broken-src]').forEach((element) => {
    if (!types.pString(element.getAttribute('src')).trim()) {
      setImgSrc(element, element.getAttribute('data-x-broken-src'))
    }
  })
}

function resolveStyleBackgroundImages(root) {
  root.querySelectorAll('[style]').forEach((element) => {
    const style = element.getAttribute('style')
    const resolved = resolveUrlInCssValue(style)
    if (resolved !== style) {
      element.setAttribute('style', resolved)
    }
  })
}

/**
 * Patches img elements inside q-editor content after it has rendered.
 *
 * @param {HTMLElement} editorContent
 * @param {Object} [options]
 * @param {Object} [options.attachments]
 * @param {string} [options.sourceHtml]
 */
function patchEditorImages(editorContent, { attachments, sourceHtml } = {}) {
  if (!editorContent) {
    return
  }

  const attachmentList = buildAttachmentList(attachments)

  editorContent.querySelectorAll('img[data-x-src-cid]').forEach((element) => {
    resolveCidImage(element, attachmentList, sourceHtml)
  })

  editorContent.querySelectorAll('img[src]').forEach((element) => {
    const src = types.pString(element.getAttribute('src')).trim()
    if (/^cid:/i.test(src)) {
      const attachment = findAttachmentByCid(attachmentList, src.substring(4))
      if (attachment?.ViewLink) {
        setImgSrc(element, attachment.ViewLink)
      }
      return
    }

    const resolved = resolveImageUrl(src)
    if (resolved && resolved !== src) {
      element.setAttribute('src', resolved)
    }
  })

  editorContent.querySelectorAll('img[data-x-broken-src]').forEach((element) => {
    if (!types.pString(element.getAttribute('src')).trim()) {
      setImgSrc(element, element.getAttribute('data-x-broken-src'))
    }
  })
}

/**
 * Prepares HTML for display in q-editor: resolves inline CID images and mail attachment URLs.
 *
 * @param {string} html
 * @param {Object} [options]
 * @param {Object} [options.attachments] Message attachments object from API
 * @param {Array} [options.foundCids] FoundedCIDs from message
 * @param {string} [options.sourceHtml] Original HTML to restore src for data-x-src-cid images
 * @return {string}
 */
function prepareHtmlForEditor(html, { attachments, foundCids, sourceHtml } = {}) {
  const source = types.pString(html)
  if (!source) {
    return ''
  }

  if (typeof DOMParser === 'undefined') {
    return source
  }

  const attachmentList = buildAttachmentList(attachments)
  const rawSourceHtml = types.pString(sourceHtml) || source
  const doc = new DOMParser().parseFromString('<div id="html-for-editor-root">' + source + '</div>', 'text/html')
  const root = doc.getElementById('html-for-editor-root')

  if (!root) {
    return source
  }

  resolveInlineImages(root, attachmentList, rawSourceHtml)
  resolveImgSrcAttributes(root, attachmentList)
  resolveStyleBackgroundImages(root)

  return root.innerHTML
}

export default {
  prepareHtmlForEditor,
  patchEditorImages,
  resolveImageUrl,
}
