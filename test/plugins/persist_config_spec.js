import {Config} from 'base/utils'
import PersistConfig from 'plugins/persist_config'
import FakePlayback from 'base/playback'
import UIObject from 'base/ui_object'
import Container from 'components/container'

describe('PersistConfig', function() {
  class FakeCore extends UIObject {
    constructor(options = {}) {
      super(options)
      this.options = options
    }
  }
  beforeEach(function() {
    this.playback = new FakePlayback()
    this.container = new Container({playback: this.playback})
    this.core = new FakeCore()
    this.core.activeContainer = this.container
    localStorage.removeItem("clappr.volume")
  })

  it('restores saved volume', function() {
    Config.persist('volume', 42)
    this.core.options = {persistConfig: true}
    this.core.activeContainer = this.container

    let persistConfig = new PersistConfig(this.core)
    expect(this.core.activeContainer.volume).to.be.equal(42)
  });

  it('persists volume when persistence is on', function() {
    // expected to be default value (100)
    this.core.options = {persistConfig: true}
    let persistConfig = new PersistConfig(this.core)
    this.container.setVolume(78)

    expect(Config.restore("volume")).to.be.equal(78)
  })

  it('does not restore volume when persistence is off', function() {
    Config.persist('volume', 42)

    let persistConfig = new PersistConfig(this.core)
    expect(this.container.volume).to.be.equal(100)
  })

  it('does not persist when persistence is off', function() {
    let persistConfig = new PersistConfig(this.core)
    this.container.setVolume(78)

    expect(Config.restore("volume")).to.be.equal(100) // default value
  })
})
