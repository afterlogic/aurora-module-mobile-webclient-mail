// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { showExternalPictures } from 'utils/messages.js'

describe('showExternalPictures', () => {
  it('moves data-x-src of blocked images to src', () => {
    const html = showExternalPictures('<p>Hi</p><img data-x-src="https://ex.com/a.png" alt="a">')

    expect(html).toContain('src="https://ex.com/a.png"')
    expect(html).not.toContain('data-x-src')
    expect(html).toContain('<p>Hi</p>')
  })

  it('shows all blocked images of the message', () => {
    const html = showExternalPictures(
      '<img data-x-src="https://ex.com/1.png"><img src="cid-image.png"><img data-x-src="https://ex.com/2.png">'
    )

    expect(html).toContain('src="https://ex.com/1.png"')
    expect(html).toContain('src="https://ex.com/2.png"')
    expect(html).toContain('src="cid-image.png"')
    expect(html).not.toContain('data-x-src')
  })

  it('adds data-x-style-url to the style of the element', () => {
    const html = showExternalPictures('<div style="color: red" data-x-style-url="background-image: url(https://ex.com/b.png)"></div>')

    expect(html).toContain('style="color: red; background-image: url(https://ex.com/b.png)"')
    expect(html).not.toContain('data-x-style-url')
  })

  it('keeps a style that already ends with a semicolon and handles a missing style', () => {
    const withSemicolon = showExternalPictures('<div style="color: red;" data-x-style-url="background: url(https://ex.com/b.png)"></div>')
    expect(withSemicolon).toContain('style="color: red; background: url(https://ex.com/b.png)"')

    const withoutStyle = showExternalPictures('<div data-x-style-url="background: url(https://ex.com/b.png)"></div>')
    expect(withoutStyle).toContain('style="background: url(https://ex.com/b.png)"')
  })

  it('does not change a message without blocked pictures', () => {
    const html = '<p>Hello <b>world</b></p><img src="https://ex.com/safe.png">'

    expect(showExternalPictures(html)).toBe(html)
  })

  it('does not run scripts or handlers of the message', () => {
    const html = showExternalPictures('<img data-x-src="https://ex.com/a.png" onerror="window.__xss = 1">')

    expect(window.__xss).toBeUndefined()
    expect(html).toContain('src="https://ex.com/a.png"')
  })

  it('returns an empty string for an empty body', () => {
    expect(showExternalPictures('')).toBe('')
    expect(showExternalPictures(null)).toBe('')
  })
})
