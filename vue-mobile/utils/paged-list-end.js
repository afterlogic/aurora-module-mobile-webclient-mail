/**
 * Whether a paged list has no more pages to load.
 * @param {{ listLength: number, totalCount: number, lastPageCount: number, itemsPerPage: number }} params
 * @returns {boolean}
 */
export function isPagedListEndReached ({ listLength, totalCount, lastPageCount, itemsPerPage }) {
  if (listLength === 0) {
    return true
  }

  if (totalCount > 0 && listLength >= totalCount) {
    return true
  }

  return lastPageCount < itemsPerPage
}
