import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updateCustomer } from "../../actions"
import { CustomerForm } from "../../customer-form"

type EditCustomerPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  })

  if (!customer) {
    notFound()
  }

  const updateCustomerWithId = updateCustomer.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
        <p className="text-muted-foreground">
          Actualiza la información del cliente seleccionado.
        </p>
      </div>

      <CustomerForm
        mode="edit"
        customer={customer}
        action={updateCustomerWithId}
      />
    </div>
  )
}