import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Screen = 'catalog' | 'warehouse' | 'job' | 'staff' | 'stock' | 'inventory' | 'procurement' | 'users'
type Role = 'Administrator' | 'Operator'

type User = {
  id: string
  email: string
  role: Role
  createdAt: string
}

type Item = {
  id: string
  sku: string
  name: string
  unit: string
  createdAt: string
}

type Warehouse = {
  id: string
  name: string
  createdAt: string
}

type Job = {
  id: string
  name: string
  createdAt: string
}

type Staff = {
  id: string
  name: string
  createdAt: string
}

type Assignment = {
  id: string
  staffId: string
  jobId: string
  startDate: string
  endDate: string
  createdAt: string
}

type Stock = {
  id: string
  warehouseId: string
  itemId: string
  quantity: number
  createdAt: string
}

type Movement = {
  id: string
  type: 'receipt' | 'transfer' | 'issue'
  itemId: string
  quantity: number
  warehouseId: string
  toWarehouseId: string | null
  jobId: string | null
  purchaseId: string | null
  createdAt: string
}

type Supplier = {
  id: string
  name: string
  createdAt: string
}

type Purchase = {
  id: string
  supplierId: string
  itemId: string
  warehouseId: string
  quantity: number
  createdAt: string
}

function App() {
  const [ready, setReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [screen, setScreen] = useState<Screen>('catalog')
  const [items, setItems] = useState<Item[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [warehouseName, setWarehouseName] = useState('')
  const [jobName, setJobName] = useState('')
  const [staffName, setStaffName] = useState('')
  const [assignmentStaffId, setAssignmentStaffId] = useState('')
  const [assignmentJobId, setAssignmentJobId] = useState('')
  const [assignmentStartDate, setAssignmentStartDate] = useState('')
  const [assignmentEndDate, setAssignmentEndDate] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [purchaseSupplierId, setPurchaseSupplierId] = useState('')
  const [purchaseItemId, setPurchaseItemId] = useState('')
  const [purchaseWarehouseId, setPurchaseWarehouseId] = useState('')
  const [purchaseQuantity, setPurchaseQuantity] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [transferItemId, setTransferItemId] = useState('')
  const [transferQuantity, setTransferQuantity] = useState('')
  const [issueWarehouseId, setIssueWarehouseId] = useState('')
  const [issueItemId, setIssueItemId] = useState('')
  const [issueJobId, setIssueJobId] = useState('')
  const [issueQuantity, setIssueQuantity] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState<Role>('Operator')
  const [error, setError] = useState('')

  async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, credentials: 'include' })
    if (response.status === 401) {
      setCurrentUser(null)
    }
    return response
  }

  async function refreshItems() {
    const response = await request('/api/items')
    if (!response.ok) return
    setItems((await response.json()) as Item[])
  }

  async function refreshWarehouses() {
    const response = await request('/api/warehouses')
    if (!response.ok) return
    setWarehouses((await response.json()) as Warehouse[])
  }

  async function refreshJobs() {
    const response = await request('/api/jobs')
    if (!response.ok) return
    setJobs((await response.json()) as Job[])
  }

  async function refreshStaff() {
    const response = await request('/api/staff')
    if (!response.ok) return
    setStaff((await response.json()) as Staff[])
  }

  async function refreshAssignments() {
    const response = await request('/api/assignments')
    if (!response.ok) return
    setAssignments((await response.json()) as Assignment[])
  }

  async function refreshStock() {
    const response = await request('/api/stock')
    if (!response.ok) return
    setStock((await response.json()) as Stock[])
  }

  async function refreshMovements() {
    const response = await request('/api/movements')
    if (!response.ok) return
    setMovements((await response.json()) as Movement[])
  }

  async function refreshSuppliers() {
    const response = await request('/api/suppliers')
    if (!response.ok) return
    setSuppliers((await response.json()) as Supplier[])
  }

  async function refreshPurchases() {
    const response = await request('/api/purchases')
    if (!response.ok) return
    setPurchases((await response.json()) as Purchase[])
  }

  async function refreshUsers() {
    const response = await request('/api/users')
    if (!response.ok) return
    setUsers((await response.json()) as User[])
  }

  async function refreshAll() {
    await Promise.all([
      refreshItems(),
      refreshWarehouses(),
      refreshJobs(),
      refreshStaff(),
      refreshAssignments(),
      refreshStock(),
      refreshMovements(),
      refreshSuppliers(),
      refreshPurchases(),
      refreshUsers(),
    ])
  }

  useEffect(() => {
    void (async () => {
      const response = await request('/api/me')
      if (response.ok) {
        setCurrentUser((await response.json()) as User)
        await refreshAll()
      }
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    if (warehouseId && !warehouses.some((warehouse) => warehouse.id === warehouseId)) {
      setWarehouseId('')
    }
  }, [warehouseId, warehouses])

  useEffect(() => {
    if (itemId && !items.some((item) => item.id === itemId)) {
      setItemId('')
    }
  }, [itemId, items])

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    })
    if (response.ok) {
      setCurrentUser((await response.json()) as User)
      setLoginEmail('')
      setLoginPassword('')
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not sign in')
  }

  async function onLogout() {
    setError('')
    await request('/api/logout', { method: 'POST' })
    setCurrentUser(null)
    setScreen('catalog')
  }

  async function onCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: userPassword, role: userRole }),
    })
    if (response.status === 201) {
      setUserEmail('')
      setUserPassword('')
      setUserRole('Operator')
      await refreshUsers()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create User')
  }

  async function onDeleteUser(id: string) {
    setError('')
    const response = await request(`/api/users/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshUsers()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete User')
  }

  async function onCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sku, name, unit }),
    })
    if (response.status === 201) {
      setSku('')
      setName('')
      setUnit('')
      await refreshItems()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Item')
  }

  async function onDeleteItem(id: string) {
    setError('')
    const response = await request(`/api/items/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Item')
  }

  async function onCreateWarehouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/warehouses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: warehouseName }),
    })
    if (response.status === 201) {
      setWarehouseName('')
      await refreshWarehouses()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Warehouse')
  }

  async function onDeleteWarehouse(id: string) {
    setError('')
    const response = await request(`/api/warehouses/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Warehouse')
  }

  async function onCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/jobs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: jobName }),
    })
    if (response.status === 201) {
      setJobName('')
      await refreshJobs()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Job')
  }

  async function onDeleteJob(id: string) {
    setError('')
    const response = await request(`/api/jobs/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshJobs()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Job')
  }

  async function onCreateStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/staff', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: staffName }),
    })
    if (response.status === 201) {
      setStaffName('')
      await refreshStaff()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Staff')
  }

  async function onDeleteStaff(id: string) {
    setError('')
    const response = await request(`/api/staff/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshStaff()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Staff')
  }

  async function onCreateAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/assignments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        staffId: assignmentStaffId,
        jobId: assignmentJobId,
        startDate: assignmentStartDate,
        endDate: assignmentEndDate,
      }),
    })
    if (response.status === 201) {
      setAssignmentStartDate('')
      setAssignmentEndDate('')
      await refreshAssignments()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Assignment')
  }

  async function onDeleteAssignment(id: string) {
    setError('')
    const response = await request(`/api/assignments/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshAssignments()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Assignment')
  }

  async function onCreateSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/suppliers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: supplierName }),
    })
    if (response.status === 201) {
      setSupplierName('')
      await refreshSuppliers()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Supplier')
  }

  async function onDeleteSupplier(id: string) {
    setError('')
    const response = await request(`/api/suppliers/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshSuppliers()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Supplier')
  }

  async function onCreatePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/purchases', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        supplierId: purchaseSupplierId,
        itemId: purchaseItemId,
        warehouseId: purchaseWarehouseId,
        quantity: Number(purchaseQuantity),
      }),
    })
    if (response.status === 201) {
      setPurchaseQuantity('')
      await refreshPurchases()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not create Purchase')
  }

  async function onDeletePurchase(id: string) {
    setError('')
    const response = await request(`/api/purchases/${id}`, { method: 'DELETE' })
    if (response.status === 204) {
      await refreshPurchases()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not delete Purchase')
  }

  async function onReceivePurchase(id: string) {
    setError('')
    const response = await request(`/api/purchases/${id}/receipts`, { method: 'POST' })
    if (response.status === 201) {
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not receive Purchase')
  }

  async function onCreateReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/receipts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        warehouseId,
        itemId,
        quantity: Number(quantity),
      }),
    })
    if (response.status === 201) {
      setQuantity('')
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not post Receipt')
  }

  async function onCreateTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/transfers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fromWarehouseId,
        toWarehouseId,
        itemId: transferItemId,
        quantity: Number(transferQuantity),
      }),
    })
    if (response.status === 201) {
      setTransferQuantity('')
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not post Transfer')
  }

  async function onCreateIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const response = await request('/api/issues', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        warehouseId: issueWarehouseId,
        itemId: issueItemId,
        jobId: issueJobId,
        quantity: Number(issueQuantity),
      }),
    })
    if (response.status === 201) {
      setIssueQuantity('')
      await refreshAll()
      return
    }
    const body = (await response.json()) as { error?: string }
    setError(body.error ?? 'Could not post Issue')
  }

  function warehouseNameOf(id: string) {
    return warehouses.find((warehouse) => warehouse.id === id)?.name ?? id
  }

  function itemLabelOf(id: string) {
    const item = items.find((row) => row.id === id)
    return item ? `${item.sku} ${item.name}` : id
  }

  function itemUnitOf(id: string) {
    return items.find((row) => row.id === id)?.unit ?? ''
  }

  function jobNameOf(id: string) {
    return jobs.find((job) => job.id === id)?.name ?? id
  }

  function staffNameOf(id: string) {
    return staff.find((row) => row.id === id)?.name ?? id
  }

  function supplierNameOf(id: string) {
    return suppliers.find((supplier) => supplier.id === id)?.name ?? id
  }

  function purchaseIsReceived(id: string) {
    return movements.some((movement) => movement.purchaseId === id)
  }

  if (!ready) {
    return null
  }

  if (!currentUser) {
    return (
      <div className="auth">
        <header className="top-nav">
          <span className="wordmark">Fake ERP</span>
        </header>
        <main className="hero-band">
          <section className="auth-card panel panel-cream">
            <h1>Sign in</h1>
            <p className="lede">Administrator or Operator.</p>
            <form onSubmit={(event) => void onLogin(event)}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </label>
              <button className="btn-primary" type="submit">
                Sign in
              </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="top-nav">
        <span className="wordmark">Fake ERP</span>
        <nav>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'catalog' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('catalog')
            }}
          >
            Catalog
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'warehouse' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('warehouse')
            }}
          >
            Warehouse
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'job' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('job')
            }}
          >
            Job
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'staff' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('staff')
            }}
          >
            Staff
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'stock' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('stock')
            }}
          >
            Stock
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'inventory' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('inventory')
            }}
          >
            Inventory
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'procurement' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('procurement')
            }}
          >
            Procurement
          </button>
          <button
            className="nav-link"
            type="button"
            aria-current={screen === 'users' ? 'page' : undefined}
            onClick={() => {
              setError('')
              setScreen('users')
            }}
          >
            Users
          </button>
        </nav>
        <div className="session">
          <span>{currentUser.email}</span>
          <button className="btn-secondary btn-compact" type="button" onClick={() => void onLogout()}>
            Logout
          </button>
        </div>
      </header>
      <main className="canvas">

      {screen === 'catalog' ? (
        <section className="page">
          <header className="page-banner page-banner-coral">
            <h1>Catalog</h1>
            <p className="lede">The master list of Items. It has no balance.</p>
          </header>
          <form className="panel panel-cream" onSubmit={(event) => void onCreateItem(event)}>
            <label>
              SKU
              <input
                name="sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                required
              />
            </label>
            <label>
              Name
              <input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label>
              Unit
              <input
                name="unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Item
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {items.length === 0 ? (
            <p className="empty">No Item in the Catalog.</p>
          ) : (
            <ul className="record-list">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.sku}</span>
                  <span>{item.name}</span>
                  <span>{item.unit}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'warehouse' ? (
        <section className="page">
          <header className="page-banner page-banner-forest">
            <h1>Warehouse</h1>
            <p className="lede">The depot where a quantity of an Item lives.</p>
          </header>
          <form className="panel panel-soft" onSubmit={(event) => void onCreateWarehouse(event)}>
            <label>
              Name
              <input
                name="warehouseName"
                value={warehouseName}
                onChange={(event) => setWarehouseName(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Warehouse
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {warehouses.length === 0 ? (
            <p className="empty">No Warehouse yet.</p>
          ) : (
            <ul className="record-list">
              {warehouses.map((warehouse) => (
                <li className="warehouse" key={warehouse.id}>
                  <span>{warehouse.name}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteWarehouse(warehouse.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'job' ? (
        <section className="page">
          <header className="page-banner page-banner-cream">
            <h1>Job</h1>
            <p className="lede">The work site. Not a Warehouse. Quantity does not belong here.</p>
          </header>
          <form className="panel panel-soft" onSubmit={(event) => void onCreateJob(event)}>
            <label>
              Name
              <input
                name="jobName"
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Job
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {jobs.length === 0 ? (
            <p className="empty">No Job yet.</p>
          ) : (
            <ul className="record-list">
              {jobs.map((job) => (
                <li className="job" key={job.id}>
                  <span>{job.name}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteJob(job.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'staff' ? (
        <section className="page">
          <header className="page-banner page-banner-forest">
            <h1>Staff</h1>
            <p className="lede">People allocated to a Job for a period. Not a User.</p>
          </header>
          <form className="panel panel-soft" onSubmit={(event) => void onCreateStaff(event)}>
            <label>
              Name
              <input
                name="staffName"
                value={staffName}
                onChange={(event) => setStaffName(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Staff
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {staff.length === 0 ? (
            <p className="empty">No Staff yet.</p>
          ) : (
            <ul className="record-list">
              {staff.map((row) => (
                <li className="staff" key={row.id}>
                  <span>{row.name}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteStaff(row.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="panel panel-soft" onSubmit={(event) => void onCreateAssignment(event)}>
            <label>
              Staff
              <select
                name="assignmentStaffId"
                value={assignmentStaffId}
                onChange={(event) => setAssignmentStaffId(event.target.value)}
                required
              >
                <option value="">Select Staff</option>
                {staff.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Job
              <select
                name="assignmentJobId"
                value={assignmentJobId}
                onChange={(event) => setAssignmentJobId(event.target.value)}
                required
              >
                <option value="">Select Job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              startDate
              <input
                name="startDate"
                type="date"
                value={assignmentStartDate}
                onChange={(event) => setAssignmentStartDate(event.target.value)}
                required
              />
            </label>
            <label>
              endDate
              <input
                name="endDate"
                type="date"
                value={assignmentEndDate}
                onChange={(event) => setAssignmentEndDate(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Assignment
            </button>
          </form>
          {assignments.length === 0 ? (
            <p className="empty">No Assignment yet.</p>
          ) : (
            <ul className="record-list">
              {assignments.map((assignment) => (
                <li className="assignment" key={assignment.id}>
                  <span>{staffNameOf(assignment.staffId)}</span>
                  <span>{jobNameOf(assignment.jobId)}</span>
                  <span>{assignment.startDate}</span>
                  <span>{assignment.endDate}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteAssignment(assignment.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'stock' ? (
        <section className="page">
          <header className="page-banner page-banner-mint">
            <h1>Stock</h1>
            <p className="lede">The quantity of one Item in one Warehouse.</p>
          </header>
          {error ? <p role="alert">{error}</p> : null}
          {stock.length === 0 ? (
            <p className="empty">No Stock yet.</p>
          ) : (
            <ul className="record-list">
              {stock.map((row) => (
                <li className="stock" key={row.id}>
                  <span>{warehouseNameOf(row.warehouseId)}</span>
                  <span>{itemLabelOf(row.itemId)}</span>
                  <span>
                    {row.quantity} {itemUnitOf(row.itemId)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'inventory' ? (
        <section className="page">
          <header className="page-banner page-banner-dark">
            <h1>Inventory</h1>
            <p className="lede">A Receipt, Transfer, or Issue that writes Stock quantity.</p>
          </header>
          <div className="movement-grid">
          <form className="panel panel-peach" onSubmit={(event) => void onCreateReceipt(event)}>
            <h2>Receipt</h2>
            <label>
              Warehouse
              <select
                name="receiptWarehouseId"
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item
              <select
                name="receiptItemId"
                value={itemId}
                onChange={(event) => setItemId(event.target.value)}
                required
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                name="receiptQuantity"
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Post Receipt
            </button>
          </form>
          <form className="panel panel-mint" onSubmit={(event) => void onCreateTransfer(event)}>
            <h2>Transfer</h2>
            <label>
              From Warehouse
              <select
                name="fromWarehouseId"
                value={fromWarehouseId}
                onChange={(event) => setFromWarehouseId(event.target.value)}
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To Warehouse
              <select
                name="toWarehouseId"
                value={toWarehouseId}
                onChange={(event) => setToWarehouseId(event.target.value)}
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item
              <select
                name="transferItemId"
                value={transferItemId}
                onChange={(event) => setTransferItemId(event.target.value)}
                required
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                name="transferQuantity"
                type="number"
                min="0"
                step="any"
                value={transferQuantity}
                onChange={(event) => setTransferQuantity(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Post Transfer
            </button>
          </form>
          <form className="panel panel-cream" onSubmit={(event) => void onCreateIssue(event)}>
            <h2>Issue</h2>
            <label>
              Warehouse
              <select
                name="issueWarehouseId"
                value={issueWarehouseId}
                onChange={(event) => setIssueWarehouseId(event.target.value)}
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item
              <select
                name="issueItemId"
                value={issueItemId}
                onChange={(event) => setIssueItemId(event.target.value)}
                required
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Job
              <select
                name="issueJobId"
                value={issueJobId}
                onChange={(event) => setIssueJobId(event.target.value)}
                required
              >
                <option value="">Select Job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                name="issueQuantity"
                type="number"
                min="0"
                step="any"
                value={issueQuantity}
                onChange={(event) => setIssueQuantity(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Post Issue
            </button>
          </form>
          </div>
          {error ? <p role="alert">{error}</p> : null}
          {movements.length === 0 ? (
            <p className="empty">No Movement yet.</p>
          ) : (
            <ul className="record-list">
              {movements.map((movement) => (
                <li className="movement" key={movement.id}>
                  <span>{movement.type}</span>
                  <span>{itemLabelOf(movement.itemId)}</span>
                  <span>
                    {movement.quantity} {itemUnitOf(movement.itemId)}
                  </span>
                  <span>{warehouseNameOf(movement.warehouseId)}</span>
                  <span>
                    {movement.toWarehouseId
                      ? warehouseNameOf(movement.toWarehouseId)
                      : movement.jobId
                        ? jobNameOf(movement.jobId)
                        : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'procurement' ? (
        <section className="page">
          <header className="page-banner page-banner-forest">
            <h1>Procurement</h1>
            <p className="lede">Supplier and Purchase. A Receipt from a Purchase raises Stock.</p>
          </header>
          <form className="panel panel-soft" onSubmit={(event) => void onCreateSupplier(event)}>
            <label>
              Name
              <input
                name="supplierName"
                value={supplierName}
                onChange={(event) => setSupplierName(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Supplier
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {suppliers.length === 0 ? (
            <p className="empty">No Supplier yet.</p>
          ) : (
            <ul className="record-list">
              {suppliers.map((supplier) => (
                <li className="supplier" key={supplier.id}>
                  <span>{supplier.name}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteSupplier(supplier.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="panel panel-soft" onSubmit={(event) => void onCreatePurchase(event)}>
            <label>
              Supplier
              <select
                name="purchaseSupplierId"
                value={purchaseSupplierId}
                onChange={(event) => setPurchaseSupplierId(event.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item
              <select
                name="purchaseItemId"
                value={purchaseItemId}
                onChange={(event) => setPurchaseItemId(event.target.value)}
                required
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Warehouse
              <select
                name="purchaseWarehouseId"
                value={purchaseWarehouseId}
                onChange={(event) => setPurchaseWarehouseId(event.target.value)}
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                name="purchaseQuantity"
                type="number"
                min="0"
                step="any"
                value={purchaseQuantity}
                onChange={(event) => setPurchaseQuantity(event.target.value)}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Create Purchase
            </button>
          </form>
          {purchases.length === 0 ? (
            <p className="empty">No Purchase yet.</p>
          ) : (
            <ul className="record-list">
              {purchases.map((purchase) => (
                <li className="purchase" key={purchase.id}>
                  <span>{supplierNameOf(purchase.supplierId)}</span>
                  <span>{itemLabelOf(purchase.itemId)}</span>
                  <span>
                    {purchase.quantity} {itemUnitOf(purchase.itemId)}
                  </span>
                  <span>{warehouseNameOf(purchase.warehouseId)}</span>
                  {purchaseIsReceived(purchase.id) ? null : (
                    <button
                      className="btn-primary btn-compact"
                      type="button"
                      onClick={() => void onReceivePurchase(purchase.id)}
                    >
                      Receive
                    </button>
                  )}
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeletePurchase(purchase.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {screen === 'users' ? (
        <section className="page">
          <header className="page-banner page-banner-cream">
            <h1>Users</h1>
            <p className="lede">A User has one Role: Administrator or Operator.</p>
          </header>
          <form className="panel panel-soft" onSubmit={(event) => void onCreateUser(event)}>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={userPassword}
                onChange={(event) => setUserPassword(event.target.value)}
                required
              />
            </label>
            <label>
              Role
              <select
                name="role"
                value={userRole}
                onChange={(event) => setUserRole(event.target.value as Role)}
                required
              >
                <option value="Operator">Operator</option>
                <option value="Administrator">Administrator</option>
              </select>
            </label>
            <button className="btn-primary" type="submit">
              Create User
            </button>
          </form>
          {error ? <p role="alert">{error}</p> : null}
          {users.length === 0 ? (
            <p className="empty">No User yet.</p>
          ) : (
            <ul className="record-list">
              {users.map((user) => (
                <li className="user" key={user.id}>
                  <span>{user.email}</span>
                  <span>{user.role}</span>
                  <button
                    className="btn-secondary btn-compact"
                    type="button"
                    onClick={() => void onDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      </main>
    </div>
  )
}

export default App
