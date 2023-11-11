
function CAttachment() {
    this.id = ''
    this.filename = ''
    this.size = ''

    this.loading = false
    this.status = 'none' //'loading',
    this.tempName = ''
    this.actions = null
    this.thumbnailUrl = ''
    this.hash = ''
}

CAttachment.prototype.polulate = function (oData) {
    this.id = oData.id
    this.filename = oData.filename
    this.size = oData.size
    this.loading = oData.loading
    this.status = oData.status
    this.tempName = oData.tempName
    this.actions = oData.actions
    this.thumbnailUrl = oData.thumbnailUrl
    this.hash = oData.hash
}

export default CAttachment