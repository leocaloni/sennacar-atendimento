import os
from pathlib import Path
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDENTIALS_PATH = Path(__file__).parent.parent / "credenciais" / "credentials.json"
TOKEN_PATH = Path(__file__).parent.parent / "credenciais" / "token.json"


# Serviço de integração com a API do Google Calendar
# Responsável pela autenticação e operações de criação e listagem de eventos
class GoogleCalendarService:
    def __init__(self):
        self.service = self._authenticate()

    # Realiza autenticação OAuth2 com o Google Calendar
    # Carrega token existente ou inicia fluxo de autenticação
    def _authenticate(self):
        creds = None
        if TOKEN_PATH.exists():
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(CREDENTIALS_PATH), SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open(TOKEN_PATH, "w") as token:
                token.write(creds.to_json())

        return build("calendar", "v3", credentials=creds)

    # Cria um evento no Google Calendar com os dados fornecidos
    # Inclui lembretes padrão por popup e email
    def create_event(self, event_data):
        try:
            event = {
                "summary": event_data["summary"],
                "description": event_data.get("description", ""),
                "start": {
                    "dateTime": event_data["start_time"].isoformat(),
                    "timeZone": "America/Sao_Paulo",
                },
                "end": {
                    "dateTime": event_data["end_time"].isoformat(),
                    "timeZone": "America/Sao_Paulo",
                },
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "popup", "minutes": 30},
                        {"method": "email", "minutes": 24 * 60},
                    ],
                },
            }
            return (
                self.service.events().insert(calendarId="primary", body=event).execute()
            )
        except HttpError as error:
            print(f"Erro ao criar evento: {error}")
            return None

    # Lista os próximos eventos no Google Calendar
    # Por padrão, retorna os 10 eventos futuros ordenados pela data de início
    def list_events(self, max_results=10):
        now = datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        try:
            events_result = (
                self.service.events()
                .list(
                    calendarId="primary",
                    timeMin=now,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )
            return events_result.get("items", [])
        except HttpError as error:
            print(f"Erro ao listar eventos: {error}")
            return []
