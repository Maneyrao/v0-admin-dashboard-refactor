export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return 'Fecha inválida'
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  } catch {
    return 'Fecha inválida'
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'hace unos segundos'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  }

  return formatDate(dateString)
}

export function getWhatsAppLink(
  phone: string,
  customerName: string,
  orderNumber: string,
  totalAmount: number
): string {
  const message = `Hola ${customerName}, recibimos tu pedido #${orderNumber} por ${formatCurrency(totalAmount)}. Coordinamos el pago por acá.`
  const encodedMessage = encodeURIComponent(message)
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function getWhatsAppLinkWithCustomMessage(
  phone: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message)
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
