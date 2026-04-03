---
title: "Deep Container Expertise, Forged at AWS"
description: "Before founding Perts Foundry, our founder served as an AWS Cloud Support Engineer for container services, resolving critical production incidents for enterprise customers across EKS, ECS, and ECR."
slug: "container-expertise-aws"
weight: 100
draft: false
params:
  client: "Amazon Web Services"
  industry: "Cloud / Technology"
  challenge: "AWS customers ranging from individual developers to global enterprises encountered critical production issues with container services that required deep technical diagnosis across networking, orchestration, and security layers."
  result: "Critical production incidents resolved, a security vulnerability in ECR scanning discovered and fixed for all users, and cross-domain expertise built across the full AWS container stack."
tags:
  - AWS
  - EKS
  - Kubernetes
  - ECS
  - ECR
  - Docker
  - Terraform
  - CloudFormation
---

_This case study reflects our founder's experience at Amazon Web Services before founding Perts Foundry. Customer details have been generalized._

## The Challenge

Before founding Perts Foundry, our founder served as a Cloud Support Engineer at AWS specializing in container services. The role provided a unique vantage point: working directly with customers ranging from individual developers to global enterprises, diagnosing their most complex production issues across EKS, ECS, ECR, and the broader AWS ecosystem.

The work was not theoretical. These were production environments running real workloads, often during active outages where customers needed answers quickly. Each case required deep diagnosis across networking, orchestration, security, and infrastructure-as-code layers, frequently spanning multiple AWS services and requiring collaboration with other service domains. The experience built a depth of container platform expertise that now informs every engagement at Perts Foundry.

## The Approach

Three incidents illustrate the depth and breadth of the work.

### Cross-Account ECR Image Pull Failure

A large enterprise customer reported that their ECS clusters could not pull container images from a cross-account ECR repository. The issue appeared to be a permissions problem, but standard IAM troubleshooting did not resolve it. Our founder collaborated with the AWS networking domain to trace the failure beyond IAM, ultimately identifying a missing Transit Gateway route association that was preventing network traffic from reaching the ECR endpoint in the other account. Once the route was added, image pulls resumed immediately.

### 300+ Node EKS Payment Application Outage

A customer running a payment application on a 300+ node EKS cluster reported that nodes were crashing and the application was down. Our founder led the response, quickly identifying that pods in the cluster lacked memory limits. Without limits, individual pods could consume unbounded memory, triggering out-of-memory (OOM) kills at the node level and cascading failures across the cluster. Our founder guided the customer's DevOps team through setting appropriate memory limits and resource requests to stabilize the cluster and restore the payment application to service.

### ECR Security Scanning Bug Discovery

While investigating a customer case, our founder discovered a bug in ECR's enhanced image scanning feature where security vulnerabilities were being missed from scan results. Rather than treating it as an isolated customer issue, our founder escalated the finding to the ECR service team and collaborated on identifying the root cause in the backend scanning code. The fix was shipped to the service, improving security scanning accuracy for all ECR users.

## Results

| Metric                  | Before                                 | After                                       |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| EKS payment application | Nodes crashing (OOM), application down | 300+ node cluster stabilized                |
| Cross-account ECR       | Image pulls failing                    | Transit Gateway route fixed, pulls restored |
| ECR scanning            | Security vulnerabilities missed        | Bug fixed, shipped to all ECR users         |

These incidents represent a fraction of the work, but they illustrate what a year of frontline AWS container support builds: the ability to diagnose problems that span multiple services and layers, the instinct to look beyond the obvious explanation, and the habit of escalating issues that affect more than one customer. The ECR scanning fix alone improved security posture for every organization using the service.

This is the expertise that Perts Foundry was built on. Every container troubleshooting session, every cross-domain investigation, and every production outage response sharpened the diagnostic skills and platform knowledge that our clients benefit from today.

## Key Technologies

{{< tech-tags "AWS, EKS, Kubernetes, ECS, ECR, Docker, Terraform, CloudFormation, VPC, Transit Gateway, Bash, Python, Linux" >}}
