import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../lib/store'

export default function SetupScreen(): JSX.Element {
  const { t } = useTranslation()
  const [url, setUrl] = useState('http://homeassistant.local:8123')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setConfig, connect, errorMessage } = useAppStore()

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!url || !token) return

    setLoading(true)
    setError(null)

    const cleanUrl = url.replace(/\/$/, '')
    setConfig({ url: cleanUrl, token })
    await connect()

    const currentStatus = useAppStore.getState().status
    if (currentStatus === 'error') {
      setError(useAppStore.getState().errorMessage ?? 'Connection failed')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--ha-surface-2)',
    border: '1px solid var(--ha-border)',
    color: 'var(--ha-text-primary)',
    width: '100%',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s'
  } as React.CSSProperties

  return (
    <div className="flex flex-col h-full p-6" style={{ background: 'var(--ha-bg)' }}>
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'var(--ha-accent)' }}
        >
          🏠
        </div>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--ha-text-primary)' }}>
            Home Assistant
          </h1>
          <p className="text-xs" style={{ color: 'var(--ha-text-secondary)' }}>
            {t('setup.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ha-text-secondary)' }}>
            {t('setup.url_label')}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://homeassistant.local:8123"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ha-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ha-border)')}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ha-text-secondary)' }}>
            {t('setup.token_label')}
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('setup.token_placeholder')}
            rows={4}
            style={{ ...inputStyle, fontFamily: 'monospace', resize: 'none' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ha-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ha-border)')}
            required
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--ha-text-disabled)' }}>
            {t('setup.token_hint')}
          </p>
        </div>

        {(error || errorMessage) && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            {error || errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url || !token}
          className="mt-auto font-medium py-2.5 rounded-lg transition-colors text-sm"
          style={{
            background: loading || !url || !token ? 'var(--ha-surface-3)' : 'var(--ha-accent)',
            color: loading || !url || !token ? 'var(--ha-text-disabled)' : '#ffffff'
          }}
        >
          {loading ? t('setup.connecting') : t('setup.connect')}
        </button>
      </form>
    </div>
  )
}
