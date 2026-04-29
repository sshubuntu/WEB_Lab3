terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.30"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "1.14"
    }
  }
}

provider "kubernetes" {
  config_path = local.config_path
}

provider "kubectl" {
  config_path = local.config_path
  load_config_file = true
}

data "kubectl_path_documents" "my_app" {
  pattern = "../k3s/manifests/*.yaml"
}

resource "kubectl_manifest" "apply_all" {
  for_each  = toset(data.kubectl_path_documents.my_app.documents)
  yaml_body = each.value
}

locals {
  config_path = "../k3s/config"
}