IGRP Process Management Frontend Dockerfile

1. Ambiente Dev Zing

1.1
Para instalação dos certificados internos da IRN, foram providenciados os seguintes certificados:

irn.internal.crt justica-ca-root.crt justica-sub-ca.crt

Se seguida, foi adicionada a seguinte secção no Dockerfile, de forma a serem instalados esses certificados:



COPY certs/irn/*.crt /usr/local/share/ca-certificates/

RUN apk update \
&& apk upgrade --available \
&& apk add ca-certificates \
&& update-ca-certificates



1. Ambiente Dev IRN
1.1 Base Images
No ambiente DEV da IRN, uma vez que são utilizadas imagens internas que incluem já a instalação dos devidos certificados, não é utilizada nenhuma secção de instalação de certificados no Dockerfile do mesmo, as imagens utilizadas são as seguintes:

FROM docker.tools.irn.internal/base/node-builder-22-14:1.0.0 AS base
FROM docker.tools.irn.internal/base/node-22-14:1.0.0 AS runner

1.2 Preservação de Dockerfile nos ambientes da IRN
Importa referir que será sempre necessário ter um elevado grau de atenção ao efetuar Merge Requests de código que vem diretamente dos repositórios da Zing, para que prevaleça sempre o Dockerfile customizado da IRN