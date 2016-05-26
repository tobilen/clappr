import {Config} from 'base/utils'
import CorePlugin from 'base/core_plugin'
import Events from 'base/events'

export default class PersistConfig extends CorePlugin {
  get name() { return 'persist_config' }

  get options() { return this.core.options }

  bindEvents() {
    this.listenTo(this.core, Events.CORE_CONTAINER_ACTIVE, this.activeContainerChanged)
    if (this.core.activeContainer) {
      this.activeContainerChanged(this.core.activeContainer)
    }
  }

  activeContainerChanged(container) {
    if (this.options.persistConfig) {
      if (this._container) {
        this.stopListening(this._container)
      } else {
        // player creation
        container.setVolume(Config.restore("volume"))
      }
      this._container = container
      if (container) {
        this.listenTo(container, Events.CONTAINER_VOLUME, this.persistVolume)
      }
    }
  }

  persistVolume() {
    Config.persist("volume", this._container.volume)
  }
}
