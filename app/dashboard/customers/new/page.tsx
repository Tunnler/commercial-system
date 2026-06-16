import { createCustomer } from "../actions"
import { CustomerForm } from "../customer-form"

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo cliente</h1>
        <p className="text-muted-foreground">
          Completa los datos para registrar un nuevo cliente.
        </p>
      </div>

      <CustomerForm mode="create" action={createCustomer} />
    </div>
  )
}