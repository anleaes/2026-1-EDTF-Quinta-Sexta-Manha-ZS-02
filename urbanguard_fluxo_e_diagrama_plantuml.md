# 🛡️ UrbanGuard - Zeladoria Urbana Colaborativa
## Diagramas de Fluxo e Classes em PlantUML

Este documento contém os diagramas de fluxos e arquitetura do projeto **UrbanGuard** descritos na linguagem **PlantUML**. Você pode copiar e colar cada bloco de código no site [PlantText](https://www.planttext.com/) ou no editor de sua preferência para renderizá-los.

---

## 🚦 1. Fluxo de Sequência: Cidadão Reportando Incidente

Este diagrama detalha o processo desde a captura da foto pelo celular do cidadão, passando pela análise automática da IA (Gemini) e geocodificação, até o processamento lógico e armazenamento final (Supabase).

```plantuml
@startuml
autonumber
skinparam Style strictuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10

actor "Cidadão\n(Usuário)" as User
box "Aplicação Cliente (React/TS)" #DarkSlateBlue
    participant "MobileApp\n(Page)" as App
    participant "ReportForm\n(Component)" as Form
end box

box "Serviços Externos" #DarkGreen
    participant "Nominatim API\n(OpenStreetMap)" as Nominatim
    participant "GeminiService\n(Google AI Studio)" as Gemini
end box

database "DatabaseClient\n(Supabase / Local)" as DB

User -> Form: Captura Foto + Coordenadas GPS
activate Form
Form -> Gemini: analyzeUrbanIncident(imageBase64)
activate Gemini
Gemini --> Form: Retorna JSON (Categoria, Severidade, Sanitizado, Resumo)
deactivate Gemini

Form -> Nominatim: getRealAddress(lat, lon)
activate Nominatim
Nominatim --> Form: Retorna Endereço Textual ("Rua X, nº Y...")
deactivate Nominatim

Form -> DB: submitReport(dados)
activate DB
note over DB: Calcula distância (Haversine)\nse menor que 30m da mesma categoria

alt Novo incidente urbano
    DB -> DB: Cria novo INCIDENT (Aberto) + REPORT (Foto)
else Ocorrência ativa já existente
    DB -> DB: Associa REPORT ao INCIDENT existente
else Reincidência (< 30 dias resolvido)
    DB -> DB: Altera INCIDENT para "reaberto_por_reincidencia"\nSoma +1 em reincidence_counter
end

DB --> Form: Confirmação de envio com sucesso
deactivate DB

Form --> App: Redireciona para o Mapa Principal
deactivate Form
App --> User: Exibe mapa atualizado com o Pin correspondente
@enduml
```

---

## 🛠️ 2. Fluxo de Atividade: Gestão Pública (Operador da Prefeitura)

Este diagrama representa o fluxo de trabalho administrativo do operador municipal a partir do painel de controle.

```plantuml
@startuml
skinparam activityFontSize 13

start
:Operador Acessa Painel Gerencial;
:Visualiza Incidentes Ordenados por Score de Prioridade;
note right
  Score = (Gravidade IA * 1.5) + (Apoios * 0.5) + (Reincidências * 2.0)
end note
:Seleciona Incidente Crítico;
:Analisa Histórico de Evidências Visuais (Carrossel);
:Clica em "Iniciar Reparo";
:Status do Incidente é alterado para "em_manutencao";
:Sistema gera Ordem de Serviço Digital (PDF);
:Equipe de campo realiza manutenção física na via;
:Operador insere Foto comprobatória do reparo concluído;
:Clica em "Marcar como Resolvido";
:Status do Incidente é alterado para "resolvido";
:Sistema envia notificação de conclusão para todos os cidadãos vinculados;
stop
@enduml
```

---

## 📊 3. Diagrama de Classes e Componentes do Sistema (React + Services)

Mapeamento da arquitetura de classes, interfaces de dados e componentes React/TypeScript utilizados na solução.

```plantuml
@startuml
skinparam linetype ortho
skinparam PackageBackgroundColor #LightYellow
skinparam ClassBackgroundColor #Aqua-White

package "Interfaces de Dados (Models)" {
  interface Incident {
    + id : string
    + latitude : number
    + longitude : number
    + address : string
    + category : string
    + status : string
    + severity_score : number
    + reincidence_counter : number
    + created_at : string
    + updated_at : string
  }

  interface Report {
    + id : string
    + incident_id : string
    + user_id : string
    + photo_url : string
    + description : string
    + ai_analysis : AITriageResult
    + created_at : string
  }

  interface AITriageResult {
    + category : string
    + severity : number
    + sanitized : boolean
    + summary : string
    + is_simulated : boolean
    + simulated_reason : string
  }
}

package "Serviços de Infraestrutura (Services)" {
  class DatabaseClient {
    + isDemo : boolean
    + supabase : SupabaseClient
    + loadClientConfig() : void
    + setForceDemo(value : boolean) : void
    + login(email, password, bypass) : Promise
    + signUp(email, password, fullName) : Promise
    + logout() : Promise
    + getCurrentUser() : any
    + getIncidents() : Promise
    + getReports(incidentId) : Promise
    + submitReport(data) : Promise
    + updateIncidentStatus(incidentId, newStatus) : Promise
    + supportIncident(incidentId) : Promise
  }

  class GeminiService {
    - apiKey : string
    - modelName : string
    + setApiKey(key : string) : void
    + hasApiKey() : boolean
    + analyzeUrbanIncident(imageBase64, mimeType) : Promise<AITriageResult>
    + simulateAITriage(failedApi) : Promise<AITriageResult>
  }
}

package "Páginas (Routes/Pages)" {
  class MobileApp {
    + incidents : Incident[]
    + selectedIncident : Incident
    + activeTab : string
    + loadData() : void
    + handleLogout() : void
  }

  class AdminDashboard {
    + incidents : Incident[]
    + selectedIncident : Incident
    + loadIncidents() : void
    + handleStatusChange(id, status) : void
    + generateOS(inc) : void
  }

  class Login {
    + email : string
    + password : string
    + handleLogin() : void
  }

  class Signup {
    + fullName : string
    + email : string
    + handleSignup() : void
  }
}

package "Componentes Visuais (Components)" {
  class MapView {
    + incidents : Incident[]
    + selectedIncident : Incident
    + onSelectIncident(inc) : void
  }

  class BottomSheet {
    + incident : Incident
    + reports : Report[]
    + handleSupport() : void
  }

  class ReportForm {
    + onCancel() : void
    + onSubmitSuccess() : void
    + takePhoto() : void
    + handleSubmit() : void
  }

  class Settings {
    + onCancel() : void
    + refreshData() : void
    + onLogout() : void
  }
}

%% Relacionamentos
DatabaseClient ..> Incident : gerencia >
DatabaseClient ..> Report : gerencia >
Report --> AITriageResult : possui >

MobileApp --> MapView : renderiza >
MobileApp --> BottomSheet : renderiza >
MobileApp --> ReportForm : renderiza >
MobileApp --> Settings : renderiza >

MobileApp ..> DatabaseClient : usa >
AdminDashboard ..> DatabaseClient : usa >
Login ..> DatabaseClient : usa >
Signup ..> DatabaseClient : usa >
BottomSheet ..> DatabaseClient : usa >
Settings ..> DatabaseClient : usa >

ReportForm ..> DatabaseClient : usa >
ReportForm ..> GeminiService : usa >
@enduml
```

---

## 🗄️ 4. Diagrama Entidade-Relacionamento (Banco de Dados Supabase)

Modelo relacional do banco de dados na estrutura Mestre-Detalhe (Pai-Filho).

```plantuml
@startuml
!theme plain
hide circle
skinparam linetype ortho

entity "PROFILES (Perfis)" as profiles {
  * id : UUID <<PK>> (Auth.users.id)
  --
  * full_name : TEXT
  * role : VARCHAR ("citizen" | "operator")
  * created_at : TIMESTAMP
}

entity "INCIDENTS (Incidentes Pais)" as incidents {
  * id : UUID <<PK>> (Gerado automaticamente)
  --
  * latitude : DOUBLE PRECISION
  * longitude : DOUBLE PRECISION
  address : TEXT
  * category : VARCHAR
  * status : VARCHAR
  severity_score : DOUBLE PRECISION
  reincidence_counter : INTEGER
  * created_at : TIMESTAMP
  * updated_at : TIMESTAMP
}

entity "REPORTS (Relatos Filhos)" as reports {
  * id : UUID <<PK>>
  --
  * incident_id : UUID <<FK>> (Referência a INCIDENTS.id)
  user_id : UUID <<FK>> (Referência a PROFILES.id)
  * photo_url : TEXT
  description : TEXT
  ai_analysis : JSONB
  * created_at : TIMESTAMP
}

entity "VOTES (Apoios)" as votes {
  * id : UUID <<PK>>
  --
  * incident_id : UUID <<FK>> (Referência a INCIDENTS.id)
  * user_id : UUID <<FK>> (Referência a PROFILES.id)
  * created_at : TIMESTAMP
}

profiles ||--o{ reports : "cria"
profiles ||--o{ votes : "apoia"
incidents ||--|{ reports : "contém"
incidents ||--o{ votes : "recebe"
@enduml
```
