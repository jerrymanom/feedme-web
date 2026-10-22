import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { JOIN_HOUSEHOLD, SIGN_IN, SIGN_UP } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'

function AccountForm() {
  const { signIn } = useSession()
  const [mode, setMode] = useState('signUp')
  const [error, setError] = useState(null)
  const [signUp, signUpState] = useMutation(SIGN_UP)
  const [signInMutation, signInState] = useMutation(SIGN_IN)
  const busy = signUpState.loading || signInState.loading
  const creating = mode === 'signUp'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const variables = { email: form.get('email'), password: form.get('password') }
    setError(null)
    try {
      const { data } = creating ? await signUp({ variables }) : await signInMutation({ variables })
      const { token, errors } = creating ? data.signUp : data.signIn
      if (token) await signIn(token)
      else setError(errors.join('. '))
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="segmented" role="tablist" aria-label="Cuenta">
        <button type="button" role="tab" aria-selected={creating} onClick={() => setMode('signUp')}>Crear cuenta</button>
        <button type="button" role="tab" aria-selected={!creating} onClick={() => setMode('signIn')}>Ya tengo cuenta</button>
      </div>
      <label>
        Correo
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Contraseña
        <input name="password" type="password" minLength={creating ? 8 : undefined} required
          autoComplete={creating ? 'new-password' : 'current-password'} />
        {creating && <small>Mínimo 8 caracteres.</small>}
      </label>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <button type="submit" className="button button-wide" disabled={busy}>
        {creating ? 'Crear cuenta' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

function JoinForm() {
  const toast = useToast()
  const [joinHousehold, { loading }] = useMutation(JOIN_HOUSEHOLD, { refetchQueries: 'active' })

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const inviteCode = new FormData(formElement).get('inviteCode').trim()
    try {
      const { data } = await joinHousehold({ variables: { inviteCode } })
      const { household, errors } = data.joinHousehold
      if (!household) return toast(errors[0], 'error')
      formElement.reset()
      toast(`Ahora compartes la cocina de ${household.name}.`)
    } catch {
      toast('No se pudo conectar con el servidor. Intenta de nuevo.', 'error')
    }
  }

  return (
    <form className="form form-inline" onSubmit={handleSubmit}>
      <label>
        ¿Te invitaron? Escribe el código
        <input name="inviteCode" autoComplete="off" required />
      </label>
      <button type="submit" className="button button-quiet" disabled={loading}>Unirme</button>
    </form>
  )
}

function HouseholdDetails() {
  const { me, household, signOut } = useSession()
  const toast = useToast()

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(household.inviteCode)
      toast('Código copiado. Compártelo con quien vive contigo.')
    } catch {
      toast('No se pudo copiar; selecciona el código y cópialo a mano.', 'info')
    }
  }

  return (
    <>
      <div className="invite">
        <p>Para compartir la despensa, pásale este código a quien vive contigo:</p>
        <p className="invite-code">{household.inviteCode}</p>
        <button type="button" className="button button-quiet" onClick={copyCode}>Copiar código</button>
      </div>

      <h2 className="section-title">Quiénes cocinan aquí</h2>
      <ul className="members">
        {household.members.map((member) => (
          <li key={member.id}>{member.email}{member.id === me.id && ' (tú)'}</li>
        ))}
      </ul>

      <JoinForm />
      <button type="button" className="link-button" onClick={signOut}>Cerrar sesión</button>
    </>
  )
}

export default function HouseholdScreen() {
  const { me, household, loading } = useSession()

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="headline">{me ? household.name : 'Tu cocina'}</h1>
        {!me && <p className="lede">Una cuenta guarda tu despensa, tus recetas y tus tickets. Compártela con quien vive contigo.</p>}
      </header>
      {loading ? <p className="quiet">Cargando…</p> : me ? <HouseholdDetails /> : <AccountForm />}
    </section>
  )
}
