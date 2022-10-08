import type { Socket } from 'socket.io'
import type { VideoSearchResult } from 'yt-search'
import type { VideoInfo } from './types'

function bootstrap() {
  // @ts-ignore
  const socket: Socket = io()
  const brandLink = document.querySelector<HTMLAnchorElement>('#brand-link')
  const searchForm = document.querySelector<HTMLFormElement>('#search-form')
  const searchFormInput = searchForm?.search as HTMLInputElement | null
  const searchFormSubmit = searchForm?.querySelector('#form-submit-button') as HTMLButtonElement | null
  const suggestionList = document.querySelector<HTMLDivElement>('#suggestion-list')
  const homeView = document.querySelector<HTMLDivElement>('#home-view')
  const loadingView = document.querySelector<HTMLDivElement>('#loading-view')
  const resultView = document.querySelector<HTMLDivElement>('#result-list-container')
  const downloadListButton = document.querySelector<HTMLButtonElement>('#download-list-button')
  const gotoTopButton = document.querySelector<HTMLButtonElement>('#goto-top-button')
  const modalBackground = document.querySelector<HTMLDivElement>('#modal-background')
  const modalContainer = document.querySelector<HTMLDivElement>('#modal-container')
  const downloadsContainer = document.querySelector<HTMLDivElement>('#downloads-container')
  const modals = modalContainer?.children

  /** window event listener */

  window.addEventListener('scroll', handleWindowScroll)
  window.addEventListener('beforeunload', handleWindowBeforeUnload, { capture: true })

  /** document event listener */

  document.addEventListener('DOMContentLoaded', handleDocumentLoad)

  /** element event listeners */

  brandLink?.addEventListener('click', handleResetPage)
  searchForm?.addEventListener('submit', handleSearchSubmit)
  searchFormInput?.addEventListener('keyup', handleSearchInputKeyUp)
  searchFormInput?.addEventListener('keydown', handleSearchInputKeyDown)
  searchFormInput?.addEventListener('focus', handleSearchInputFocus)
  searchFormInput?.addEventListener('blur', handleSearchInputBlur)
  gotoTopButton?.addEventListener('click', handleGotoTop)
  modalBackground?.addEventListener('click', handleModalBackgroundClick)
  downloadListButton?.addEventListener('click', handleShowDownloads)

  /** socket event listeners */

  socket.on('suggest', handleSuggestions as (suggestions: string[]) => void)
  socket.on('error', handleError as (message: any) => void)
  socket.on('search-result', handleSearchResult)
  socket.on('download-ready', handleDownload)
  socket.on('disconnect', handleDisconnection)

  /** element event handlers */

  function handleShowDownloads() {
    openDownloadsModal()
  }

  function handleDocumentLoad() {
    const modalButtons = modalContainer?.querySelectorAll('button[data-action=hide-modal]')
    if (!modalButtons) return
    for (const button of modalButtons) {
      button.addEventListener('click', () => {
        closeModal()
      })
    }
  }

  function handleModalBackgroundClick(e: Event) {
    if (e.target === modalBackground || e.target === modalContainer) closeModal()
  }

  function handleGotoTop() {
    scrollToTop()
  }

  function handleSearchInputBlur() {
    setTimeout(() => {
      suggestionList?.classList.add('hidden')
    }, 100)
  }

  function handleSearchInputFocus() {
    if (suggestionList?.childElementCount && suggestionList?.childElementCount > 0) {
      suggestionList.classList.remove('hidden')
    }
  }

  function handleSearchInputKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    if (!suggestionList?.childElementCount) return
    e.preventDefault()
    const suggestions = suggestionList.children
    let index = (e.key === 'ArrowUp' ? -1 : 1) + parseInt(suggestionList.dataset.index as string)
    if (index < 0) index = -1
    suggestionList.dataset.index = index <= suggestionList.childElementCount - 1 ? '-1' : `${suggestionList.childElementCount}`
    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i]
      if (i === index) {
        suggestion.classList.add('bg-gray-100')
        suggestionList.dataset.index = `${index}`
        continue
      }
      suggestion.classList.remove('bg-gray-100')
    }
  }

  function handleSearchInputKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || searchFormInput?.hasAttribute('disabled')) return
    const input = searchFormInput?.value.trim()
    if (!suggestionList?.childElementCount && suggestionList) suggestionList.dataset.index = '-1'
    if (input && input.length < 1) {
      if (suggestionList) suggestionList.innerHTML = ''
      return
    }
    socket.emit('get-suggestion', input)
  }

  function handleSearchSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (suggestionList?.childElementCount) {
      for (const suggestion of suggestionList.children) {
        if (suggestion.classList.contains('bg-gray-100')) {
          if (searchFormInput && suggestion.textContent)
            searchFormInput.value = suggestion.textContent.trim()
          break
        }
      }
    }
    const input = searchFormInput?.value.trim()
    if (!input) return
    searchFormInput?.setAttribute('disabled', 'true')
    homeView?.classList.remove('grid')
    homeView?.classList.add('hidden')
    loadingView?.classList.remove('hidden')
    resultView?.classList.add('hidden')
    searchFormSubmit?.classList.add('pointer-events-none')
    socket.emit('search', input)
  }

  function handleResetPage(e: Event) {
    e.preventDefault()
    if (!loadingView?.classList.contains('hidden')) return
    closeModal()
    homeView?.classList.remove('hidden')
    homeView?.classList.add('grid')
    resultView?.classList.add('hidden')
    if (searchFormInput) searchFormInput.value = ''
    handleSuggestions([])
  }

  /** socket event handlers */

  function handleDisconnection() {
    handleError('An error occurs, reloading..')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  function handleSocketDownload(error: string, info: VideoInfo, _type: string, stream: any) {
    if (error) {
      handleError(error)
      return
    }
    const { owner: _, title } = info
    openNoticeModal(`Downloading ${_type}`, title)
    const container = document.createElement('p')
    container.className = 'mt-4 bg-gray-100 rounded-lg p-4 overflow-x-hidden text-ellipsis'
    const _title = document.createElement('span')
    _title.className = 'mr-2'
    _title.textContent = title
    const badge = document.createElement('span')
    badge.className = 'bg-blue bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-flex gap-x-2 items-center'
    badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" clip-rule="evenodd" /></svg>'
    if (_type === 'video') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zm1.5 0v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5A.375.375 0 003 5.625zm16.125-.375a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0021 7.125v-1.5a.375.375 0 00-.375-.375h-1.5zM21 9.375A.375.375 0 0020.625 9h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zM4.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5zM3.375 15h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h1.5a.375.375 0 00.375-.375v-1.5A.375.375 0 004.875 9h-1.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375zm4.125 0a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clip-rule="evenodd" /></svg>'
    }
    const speed = document.createElement('span')
    badge.append(speed)
    speed.textContent = 'pending'
    container.append(_title, badge)
    downloadsContainer?.append(container)
    setDownloadListButtonVisibility()
    const data: Uint8Array[] = []
    let dataLength = 0
    stream.on('data', (chunk: Uint8Array) => {
      data.push(chunk)
      dataLength += chunk.length
      speed.textContent = `${(dataLength / (1000 * 1000)).toFixed(2)}MB`
    })
    stream.on('error', (error: string) => {
      handleError(error)
      container.remove()
      setDownloadListButtonVisibility()
    })
    stream.on('end', () => {
      const fileData = new Uint8Array(dataLength)
      let index = 0
      for (const chunk of data) {
        for (let i = 0; i < chunk.length; i++) {
          fileData[index] = chunk[i]
          index++
        }
      }
      const blob = new Blob([fileData], { type: 'octet/stream' })
      const dl = document.createElement('a')
      const url = window.URL.createObjectURL(blob)
      dl.href = url
      dl.download = title.replace(/[/\\?%*:|"<>]/g, '-') + (_type === 'audio' ? '.mp3' : '.mp4')
      dl.click()
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        container.remove()
        setDownloadListButtonVisibility()
        const downloadModal = modalContainer?.querySelector('[data-modal=downloads]')
        if (!downloadModal?.classList.contains('hidden') && !downloadsContainer?.childElementCount) {
          closeModal()
        }
      }, 100)
    })
  }

  function handleDownload(videoId: string, _type: string) {
    // @ts-ignore
    const stream = ss.createStream()
    // @ts-ignore
    ss(socket).emit('download', stream, { videoId, _type }, (error, info) => {
      if (error) {
        openErrorModal(error)
        return
      }
      handleSocketDownload(error, info, _type, stream)
    })
  }

  function handleSearchResult(videos: VideoSearchResult[]) {
    searchFormInput?.removeAttribute('disabled')
    loadingView?.classList.add('hidden')
    resultView?.classList.remove('hidden')
    searchFormSubmit?.classList.remove('pointer-events-none')
    const contentContainer = resultView?.querySelector('#result-list')
    if (contentContainer?.innerHTML) contentContainer.innerHTML = ''
    for (const video of videos) {
      const container = document.createElement('div')
      container.className = 'rounded-lg mb-auto overflow-hidden shadow'
      const header = document.createElement('header')
      const previewContainer = document.createElement('div')
      const imagePreview = document.createElement('img')
      imagePreview.alt = video.title
      imagePreview.loading = 'lazy'
      imagePreview.title = video.title
      imagePreview.src = video.thumbnail
      previewContainer.append(imagePreview)
      const titleContainer = document.createElement('h2')
      titleContainer.className = 'm-4 px-4 text-ellipsis border-l-4 border-l-red-500 font-bold'
      titleContainer.append(document.createTextNode(video.title))
      const channelContainer = document.createElement('p')
      channelContainer.className = 'text-slate-900/50 text-sm mx-4 font-bold mb-4'
      channelContainer.append(document.createTextNode(video.author.name))
      header.append(previewContainer, titleContainer, channelContainer)
      const buttonContainer = document.createElement('section')
      buttonContainer.className = 'flex items-center text-white justify-between bg-red-700'
      const audioButton = document.createElement('button')
      audioButton.className = 'bg-red-500 hover:bg-red-700 transition-color duration-100 w-1/3 p-4 flex justify-center'
      audioButton.type = 'button'
      audioButton.title = 'Download MP3'
      audioButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" clip-rule="evenodd" /></svg>'
      audioButton.addEventListener('click', () => {
        socket.emit('request-download', video.videoId, 'audio')
      })
      const viewButton = document.createElement('button')
      viewButton.className = 'bg-red-600 hover:bg-red-700 transition-color duration-100 w-1/3 p-4 flex justify-center'
      viewButton.type = 'button'
      viewButton.title = 'View'
      viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>'
      viewButton.addEventListener('click', () => {
        let iframePreview = previewContainer.querySelector('iframe')
        if (!iframePreview) {
          iframePreview = document.createElement('iframe')
          iframePreview.className = 'w-full min-h-[185px] hidden'
          iframePreview.src = `https://www.youtube.com/embed/${video.videoId}?rel=0&enablejsapi=1&autoplay=1`
          iframePreview.allow = 'autoplay'
          iframePreview.title = video.title
          iframePreview.allow = "autoplay; encrypted-media"
          previewContainer.append(iframePreview)
        }
        if (iframePreview.classList.contains('hidden')) {
          iframePreview.classList.remove('hidden')
          iframePreview.contentWindow?.postMessage('{ "event": "command", "func": "playVideo", "args": "" }', '*')
          imagePreview.classList.add('hidden')
          viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" /></svg>'
          return
        }
        iframePreview.classList.add('hidden')
        iframePreview.contentWindow?.postMessage('{ "event": "command", "func": "pauseVideo", "args": "" }', '*')
        imagePreview.classList.remove('hidden')
        viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>'

      })
      const videoButton = document.createElement('button')
      videoButton.className = 'bg-red-500 hover:bg-red-700 transition-color duration-100 w-1/3 p-4 flex justify-center'
      videoButton.type = 'button'
      videoButton.title = 'Download MP4'
      videoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zm1.5 0v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5A.375.375 0 003 5.625zm16.125-.375a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0021 7.125v-1.5a.375.375 0 00-.375-.375h-1.5zM21 9.375A.375.375 0 0020.625 9h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5zM4.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5zM3.375 15h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h1.5a.375.375 0 00.375-.375v-1.5A.375.375 0 004.875 9h-1.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375zm4.125 0a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clip-rule="evenodd" /></svg>'
      videoButton.addEventListener('click', () => {
        socket.emit('request-download', video.videoId, 'video')
      })
      buttonContainer.append(audioButton, viewButton, videoButton)
      container.append(header, buttonContainer)
      contentContainer?.append(container)
    }
    scrollToTop()
  }


  function handleSuggestions(suggestions: string[]) {
    if (suggestionList) suggestionList.innerHTML = ''
    if (suggestions.length < 1) {
      suggestionList?.classList.add('hidden')
      return
    }
    const suggestionElements: HTMLParagraphElement[] = []
    for (let i = 0; i < suggestions.slice(0, 7).length; i++) {
      const suggestion = suggestions[i]
      const container = document.createElement('p')
      const text = suggestion.replace(/\\u[\dA-F]{4}/gi, match =>
        String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      )
      container.className = 'p-4 cursor-default md:cursor-pointer'
      container.append(document.createTextNode(text))
      container.addEventListener('click', () => {
        searchFormSubmit?.click()
      })
      container.addEventListener('mouseenter', () => {
        const suggestions = suggestionList?.children
        if (!suggestions) return
        for (const suggestion of suggestions) {
          if (suggestion === container) {
            suggestion.classList.add('bg-gray-100')
            suggestionList.dataset.index = `${i}`
            continue
          }
          suggestion.classList.remove('bg-gray-100')
        }
      })
      suggestionElements.push(container)
    }
    suggestionList?.append(...suggestionElements)
    suggestionList?.classList.remove('hidden')
  }

  function handleWindowBeforeUnload(e: Event) {
    if (downloadsContainer?.childElementCount) {
      return confirm('Download list is not empty, are you sure you want to leave the page?')
    }
  }

  function handleWindowScroll() {
    const doc = document.documentElement
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    true && top > 0 ? gotoTopButton?.classList.remove('scale-0') : gotoTopButton?.classList.add('scale-0')
  }

  /** function declarations */

  function setDownloadListButtonVisibility() {
    if (downloadsContainer?.childElementCount) {
      downloadListButton?.classList.remove('scale-0')
      return
    }
    downloadListButton?.classList.add('scale-0')
  }

  function openDownloadsModal() {
    openModal('downloads')
  }

  function openNoticeModal(title: string, message: string) {
    const modal = openModal('notice')
    const titleContainer = modal?.querySelector('h2')
    const messageContainer = modal?.querySelector('p')
    if (typeof titleContainer?.textContent === 'string' && typeof messageContainer?.textContent === 'string') {
      titleContainer.textContent = title
      messageContainer.textContent = message
    }
  }

  function openErrorModal(message: string) {
    const modal = openModal('error')
    const messageContainer = modal?.querySelector('p')
    if (messageContainer?.textContent) messageContainer.textContent = message
  }

  function openModal(_type: string): HTMLDivElement | null {
    closeModal()
    modalBackground?.classList.remove('hidden')
    modalBackground?.classList.add('flex')
    if (!modals) return null
    let reference = null
    for (const modal of modals) {
      if (!(modal instanceof HTMLElement)) continue
      if (modal.dataset.modal === _type) {
        modal.classList.remove('hidden')
        reference = modal
      }
    }

    document.body.classList.add('overflow-hidden')
    return reference as HTMLDivElement
  }

  function closeModal() {
    modalBackground?.classList.add('hidden')
    modalBackground?.classList.remove('flex')
    if (!modals) return
    for (const modal of modals) {
      modal.classList.add('hidden')
    }
    document.body.classList.remove('overflow-hidden')
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleError(message: string) {
    openErrorModal(message)
  }
}
bootstrap()