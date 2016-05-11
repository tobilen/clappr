import UICorePlugin from 'base/ui_core_plugin'
import template from 'base/template'
import Playback from 'base/playback'
import Styler from 'base/styler'
import Events from 'base/events'
import dvrStyle from './public/dvr_controls.scss'
import dvrHTML from './public/index.html'
import $ from 'clappr-zepto'

export default class DVRControls extends UICorePlugin {
  get template() { return template(dvrHTML) }
  get name() { return 'dvr_controls' }
  get events() { return { click: this.click } }
  get attributes() {
    return {
      'class': 'dvr-controls',
      'data-dvr-controls': '',
    }
  }
  get mediaControl() {
    return this.core.getPlugin('media_control')
  }

  constructor(core) {
    super(core)
    this.core = core
    this.settingsUpdate()
  }

  bindEvents() {
    this.listenTo(this.core, Events.CORE_CONTAINER_ACTIVE, this.containerChanged)
    this.listenTo(this.core, Events.CORE_MEDIACONTROL_RENDERED, this.settingsUpdate)
    this.listenTo(this.core, Events.CORE_OPTIONS_CHANGE, this.render)
    if (this.core.getCurrentContainer()) {
      this.listenToOnce(this.core.getCurrentContainer(), Events.CONTAINER_TIMEUPDATE, this.render)
      this.listenTo(this.core.getCurrentContainer(), Events.CONTAINER_PLAYBACKDVRSTATECHANGED, this.dvrChanged)
    }
  }

  containerChanged() {
    this.stopListening()
    this.bindEvents()
  }

  dvrChanged(dvrEnabled) {
    this.settingsUpdate()
    this.mediaControl.$el.addClass('live')
    if (dvrEnabled) {
      this.mediaControl.$el.addClass('dvr')
      this.mediaControl.$el.find('.media-control-indicator[data-position], .media-control-indicator[data-duration]').hide()
    } else {
      this.mediaControl.$el.removeClass('dvr')
    }
  }

  click() {
    var container = this.mediaControl.container
    if (!container.isPlaying()) {
      container.play()
    }
    if (this.mediaControl.$el.hasClass('dvr')) {
      container.seek(container.getDuration())
    }
  }

  settingsUpdate() {
    this.stopListening()
    this.render()
    this.bindEvents()
  }

  shouldRender() {
    var useDvrControls = this.core.options.useDvrControls === undefined || !!this.core.options.useDvrControls
    return useDvrControls && this.core.getPlaybackType() === Playback.LIVE
  }

  render() {
    if (this.shouldRender()) {
      this.style = this.style || Styler.getStyleFor(dvrStyle, { baseUrl: this.core.options.baseUrl })
      this.$el.html(this.template())
      this.$el.append(this.style)
      this.mediaControl.$el.addClass('live')
      this.mediaControl.$('.media-control-left-panel[data-media-control]').append(this.$el)
    }
    return this
  }
}
