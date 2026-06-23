const FORM_NAME = "contact";

export type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  message: string;
};

export async function submitContactForm(data: ContactPayload): Promise<void> {
  const body = new URLSearchParams({
    "form-name": FORM_NAME,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    company: data.company ?? "",
    projectType: data.projectType,
    budget: data.budget ?? "",
    message: data.message,
  });

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'envoi du formulaire");
  }
}

export { FORM_NAME };
