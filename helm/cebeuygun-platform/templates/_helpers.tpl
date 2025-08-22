{{/*
Expand the name of the chart.
*/}}
{{- define "cebeuygun-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "cebeuygun-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cebeuygun-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cebeuygun-platform.labels" -}}
helm.sh/chart: {{ include "cebeuygun-platform.chart" . }}
{{ include "cebeuygun-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cebeuygun-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cebeuygun-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
PostgreSQL fullname
*/}}
{{- define "cebeuygun-platform.postgresql.fullname" -}}
{{- printf "%s-postgresql" (include "cebeuygun-platform.fullname" .) }}
{{- end }}

{{/*
PostgreSQL secret name
*/}}
{{- define "cebeuygun-platform.postgresql.secretName" -}}
{{- printf "%s-postgresql" (include "cebeuygun-platform.fullname" .) }}
{{- end }}

{{/*
Redis fullname
*/}}
{{- define "cebeuygun-platform.redis.fullname" -}}
{{- printf "%s-redis-master" (include "cebeuygun-platform.fullname" .) }}
{{- end }}

{{/*
Redis secret name
*/}}
{{- define "cebeuygun-platform.redis.secretName" -}}
{{- printf "%s-redis" (include "cebeuygun-platform.fullname" .) }}
{{- end }}