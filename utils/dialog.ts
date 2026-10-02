const getDialog = (dialogId: string) => {
  const dialog = document.getElementById(dialogId)

  if (!(dialog instanceof HTMLDialogElement)) {
    throw new Error(`Dialog with id "${dialogId}" was not found`)
  }

  return dialog
}

const getDialogActions = (
  dialogId: string
): {
  open: () => void
  close: () => void
} => {
  const open = () => {
    getDialog(dialogId).showModal()
  }

  const close = () => {
    getDialog(dialogId).close()
  }

  return { open, close }
}

export default getDialogActions
