export const environment = {
  production: false,
  jiraURL: window.location.hostname == "portail-pfd.retraite.aa" ? "https://jira.retraite.aa" : "https://jira-h.retraite.aa",
  pfdAPIURL: window.location.hostname == "portail-pfd.retraite.aa" ? "https://vxlpfdpfw001:3001" : "https://valpfdpfw001:3001"
};