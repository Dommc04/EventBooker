import { useState } from 'react'
import { Button, Input } from './ui'

export default function SetupName({ onSave }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'var(--surface)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        maxWidth: 400,
        width: '90%',
        textAlign: 'center',
        border: '0.5px solid var(--border)'
      }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: '0.5rem' }}>Welcome to Mixer!</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please enter your name to get started.
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            autoFocus
          />
          <Button
            type="submit"
            style={{ marginTop: '1.5rem', width: '100%' }}
            disabled={!name.trim()}
          >
            Get Started
          </Button>
        </form>
      </div>
    </div>
  )
}