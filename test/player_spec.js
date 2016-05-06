import Player from '../src/components/player'
import Events from '../src/base/events'
import Log from '../src/plugins/log'
import MediaControl from '../src/plugins/media_control'

import {template} from '../src/base/utils'

describe('Player', function() {
  describe('constructor', function() {

    it('has unique sequential id', function() {
      var player1 = new Player({source: '/playlist.m3u8', baseUrl: 'http://cdn.clappr.io/latest'})
      var player2 = new Player({source: '/playlist.m3u8', baseUrl: 'http://cdn.clappr.io/latest'})
      var player3 = new Player({source: '/playlist.m3u8', baseUrl: 'http://cdn.clappr.io/latest'})

      var p1Id = player1.options.playerId
      var p2Id = player2.options.playerId
      var p3Id = player3.options.playerId

      expect(p2Id).to.be.above(p1Id)
      expect(p3Id).to.be.above(p2Id)
    })

    it('uses the baseUrl passed from initialization', function() {
      var player = new Player({source: '/playlist.m3u8', baseUrl: 'http://cdn.clappr.io/latest'})
      expect(player.options.baseUrl).to.be.equal('http://cdn.clappr.io/latest')
    })

    it('persists config by default', function() {
      var player = new Player({source: '/playlist.m3u8'})
      expect(player.options.persistConfig).to.be.equal(true)
    })

    it('can set persists config', function() {
      var player = new Player({source: '/playlist.m3u8', persistConfig: false})
      expect(player.options.persistConfig).to.be.equal(false)
    })

    it('should normalize sources', function() {
      var player = new Player({source: '/playlist.m3u8', persistConfig: false})
      var normalizedSources = player.normalizeSources({sources: ["http://test.mp4"]})
      expect(normalizedSources).to.have.length(1)
      expect(normalizedSources[0]).to.be.equal('http://test.mp4')

      normalizedSources = player.normalizeSources({source: "http://test.mp4"})
      expect(normalizedSources).to.have.length(1)
      expect(normalizedSources[0]).to.be.equal('http://test.mp4')

      normalizedSources = player.normalizeSources({sources: []})
      expect(normalizedSources).to.have.length(1)
      expect(JSON.stringify(normalizedSources[0])).to.be.equal(JSON.stringify({source: "", mimeType: ""}))
    })

    it('should trigger error events', function() {
      var player = new Player({source: '/video.mp4', persistConfig: false})
      var element = document.createElement('div')
      var onError = sinon.spy()
      player.on(Events.PLAYER_ERROR, onError)
      player.attachTo(element)
      // some playbacks don't have an error() method. e.g flash
      if (player.core.getCurrentContainer().playback.error) {
        player.core.getCurrentContainer().playback.error()
        expect(onError).called.once
      }
    })
  })

  describe('embed parameters', function() {
    describe('custom media control', function() {
      Log.setLevel(Log.LEVEL_ERROR + 1)
      class CustomMediaControl extends MediaControl {
        get template() { return template('<div>Tada!</div>') }
      }

      var player

      afterEach(function() {
        if (player) {
          player.destroy()
          player = null
        }
      })

      it('should expose the media control through the getPlugin helper', function() {
        var player = new Player({
          source: '/playlist.m3u8',
          persistConfig: false
        })
        player.attachTo(document.body)
        expect(player.getPlugin('media_control')).to.equal(player.core.mediaControl)
      })

      it('should use the default media control when no special parameter is passed', function() {
        var player = new Player({
          source: '/playlist.m3u8',
          persistConfig: false
        })
        player.attachTo(document.body)
        expect(player.getPlugin('media_control')).to.be.an.instanceof(MediaControl)
        expect(player.getPlugin('media_control')).not.to.be.an.instanceof(CustomMediaControl)
      })

      it('should support passing an external media control in plugins list', function() {
        var player = new Player({
          source: '/playlist.m3u8',
          persistConfig: false,
          plugins: [CustomMediaControl]
        })
        player.attachTo(document.body)
        expect(player.getPlugin('media_control')).to.be.an.instanceof(CustomMediaControl)
      })

      it('should support passing an external media control in plugins hash parameter', function() {
        var player = new Player({
          source: '/playlist.m3u8',
          persistConfig: false,
          plugins: {core: [CustomMediaControl]}
        })
        player.attachTo(document.body)
        expect(player.getPlugin('media_control')).to.be.an.instanceof(CustomMediaControl)
      })

      it('should support passing an external media control as part of the mediacontrol hash', function() {
        var player = new Player({
          source: '/playlist.m3u8',
          persistConfig: false,
          mediacontrol: {external: CustomMediaControl}
        })
        player.attachTo(document.body)
        expect(player.getPlugin('media_control')).to.be.an.instanceof(CustomMediaControl)
      })
    })
  })
})
