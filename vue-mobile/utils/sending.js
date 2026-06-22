import { i18n } from 'boot/i18n'

import TextUtils from 'src/utils/text'
import DateUtils from 'src/utils/date'

import Types from 'src/utils/types'

import { FOLDER_TYPES } from '../enums'
import { getRecipientsString } from './messages'


function getFullAddr(sourceData) {
    return sourceData.DislpayName ? sourceData.DislpayName + ' <' + sourceData.Email + '>' : sourceData.Email
        //  'label': sourceData.DislpayName ? (sourceData.DislpayName + ' ' + sourceData.Email) : sourceData.Email,
}

/**
 * Obtains a subject of the message, which is the answer (reply or forward):
 * - adds the prefix "Re" of "Fwd" if the language is English, otherwise - their translation
 * - joins "Re" and "Fwd" prefixes if it is allowed for application in settings
 * 
 * @param {string} sSubject Subject of the message, the answer to which is composed
 * @param {boolean} bForward If **true** the prefix will be "Fwd", otherwise - "Re"
 *
 * @return {string}
 */
function getReplySubject(sSubject, bForward) {
    const
        sRePrefix = i18n.global.tc('MAILWEBCLIENT.TEXT_REPLY_PREFIX'),
        sFwdPrefix = i18n.global.tc('MAILWEBCLIENT.TEXT_FORWARD_PREFIX'),
        sReSubject = (bForward ? sFwdPrefix : sRePrefix) + ': ' + sSubject

    //   if (Settings.JoinReplyPrefixes) {
    //     sReSubject = MessageUtils.joinReplyPrefixesInSubject(sReSubject, sRePrefix, sFwdPrefix)
    //   }

    return sReSubject
}

/**
 * @param {Object} oMessage
 * @param {number} iAccountId
 * @param {Object} oFetcherOrIdentity
 * @param {boolean} bPasteSignatureAnchor
 * 
 * @return {string}
 */
function getReplyMessageBody(oMessage, iAccountId, oFetcherOrIdentity, bPasteSignatureAnchor)
{
	const
		sReplyTitle = i18n.global.tc('MAILWEBCLIENT.TEXT_REPLY_MESSAGE', {
			'DATE': DateUtils.getDate(oMessage.timeStampInUTC, true), //oMessage.oDateModel.getDate(),
			'TIME': DateUtils.getTime(oMessage.timeStampInUTC, true), //oMessage.oDateModel.getTime(),
			'SENDER': TextUtils.encodeHtml(getFullAddr(oMessage.from)),
		}),
		sReplyBody = '<br /><br />'
            // + this.getSignatureText(iAccountId, oFetcherOrIdentity, bPasteSignatureAnchor)
            + '<br /><br />'
			+ '<div data-anchor="reply-title">' + sReplyTitle + '</div>'
            + '<blockquote>' + oMessage.html /*oMessage.getConvertedHtml()*/ + '</blockquote>'
	;

	return sReplyBody;
}

/**
 * @param {Object} oMessage
 * @param {number} iAccountId
 * @param {Object} oFetcherOrIdentity
 * 
 * @return {string}
 */
function getForwardMessageBody(oMessage, iAccountId, oFetcherOrIdentity) {
    const
        sCcAddr = TextUtils.encodeHtml(getFullAddr(oMessage.cc)),
        sCcPart = (sCcAddr !== '') ? i18n.global.tc('MAILWEBCLIENT.TEXT_FORWARD_MESSAGE_CCPART', { 'CCADDR': sCcAddr }) : '',
        sForwardTitle = i18n.global.tc('MAILWEBCLIENT.TEXT_FORWARD_MESSAGE', {
            'FROMADDR': TextUtils.encodeHtml(getFullAddr(oMessage.from)),
            'TOADDR': TextUtils.encodeHtml(getFullAddr(oMessage.to)),
            'CCPART': sCcPart,
            'FULLDATE': DateUtils.getFullDate(oMessage.timeStampInUTC, true),//oMessage.oDateModel.getFullDate(),
            'SUBJECT': TextUtils.encodeHtml(oMessage.subject)
        }),
        sForwardBody = '<br /><br />'
            // + this.getSignatureText(iAccountId, oFetcherOrIdentity, true)
            + '<br /><br />'
            + '<div data-anchor="reply-title">' + sForwardTitle + '</div><br /><br />'
            + oMessage.html //oMessage.getConvertedHtml()
        ;

    return sForwardBody;
};

function getDraftFolder(getFolderByType, accountId) {
    return getFolderByType(accountId, FOLDER_TYPES.DRAFTS)
}

function getPlainBodyText(body) {
    return Types.pString(body)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function hasRecipients(value) {
    if (Array.isArray(value)) {
        return value.length > 0
    }
    return Types.pString(value).trim() !== ''
}

function hasSaveableContent(fields) {
    const subject = Types.pString(
        fields.subjectInput !== undefined ? fields.subjectInput : fields.Subject
    ).trim()

    if (subject !== '') {
        return true
    }

    const to = fields.toInput !== undefined ? fields.toInput : fields.To
    const cc = fields.ccInput !== undefined ? fields.ccInput : fields.Cc
    const bcc = fields.bccInput !== undefined ? fields.bccInput : fields.Bcc

    if (hasRecipients(to) || hasRecipients(cc) || hasRecipients(bcc)) {
        return true
    }

    const body = fields.bodyInput !== undefined ? fields.bodyInput : fields.Text

    return getPlainBodyText(body) !== ''
}

function buildAttachmentsParam(attachments) {
    const attachmentsParam = {}
    attachments.forEach((item) => {
        const data = {
            sFileName: item.filename,
            sCID: '',
            isInline: '0',
            isLinked: '0',
            sContentLocation: '',
        }
        attachmentsParam[item.tempName] = [
            data.sFileName,
            data.sCID,
            data.isInline,
            data.isLinked,
            data.sContentLocation,
        ]
    })
    return attachmentsParam
}

function buildMessageBody(bodyInput) {
    return `<div data-crea="font-wrapper" style="font-family: Tahoma, sans-serif; font-size: 16px; direction: ltr"><br>${bodyInput}<br></div>`
}

function buildComposeParameters({
    accountId,
    toInput,
    ccInput,
    bccInput,
    subjectInput,
    bodyInput,
    attachments,
    draftUid = '',
    draftFolder = '',
    sentFolder = '',
}) {
    return {
        AccountID: accountId,
        DraftInfo: [],
        DraftUid: draftUid,
        DraftFolder: draftFolder,
        To: getRecipientsString(toInput),
        Cc: getRecipientsString(ccInput),
        Bcc: getRecipientsString(bccInput),
        Subject: subjectInput,
        Text: buildMessageBody(bodyInput),
        IsHtml: true,
        Importance: 3,
        SendReadingConfirmation: false,
        Attachments: buildAttachmentsParam(attachments),
        InReplyTo: '',
        References: '',
        SentFolder: sentFolder,
    }
}

export default {
    getReplySubject,
    getReplyMessageBody,
    getForwardMessageBody,
    getDraftFolder,
    getPlainBodyText,
    hasSaveableContent,
    buildAttachmentsParam,
    buildMessageBody,
    buildComposeParameters,
}
