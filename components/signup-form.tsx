"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth-client"
import { useRouter } from "next/navigation"



export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  
    const formData = new FormData(event.currentTarget)
  
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
  
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string
  
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
  
    const res = await signUp.email({
      email: formData.get("email") as string,
      password,
      name: `${firstName} ${lastName}`,
    })
  
    if (res.error) {
      console.error(res.error)
      alert(res.error.message ?? "Ocurrió un error al crear la cuenta")
      return
    }
  
    router.push("/dashboard")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Ingresa tu correo electrónico para crear tu cuenta
                </p>
              </div>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Sebastian"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Rivera"
                    required
                  />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  name="email"
                  required
                />
                <FieldDescription>
                  Usaremos este correo para contactarte. No lo compartiremos con nadie más.
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input id="password" type="password" name="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar contraseña
                    </FieldLabel>
                    <Input id="confirm-password" type="password" name="confirm-password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  Debe contener al menos 8 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Crear cuenta</Button>
              </Field>

              <FieldDescription className="text-center">
                ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptas nuestros <a href="#">Términos de servicio</a> y nuestra <a href="#">Política de privacidad</a>.
      </FieldDescription>
    </div>
  )
}
