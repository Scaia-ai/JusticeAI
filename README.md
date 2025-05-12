In folder JusticeAI

docker build -t justiceapp .  
docker tag justiceapp  justiceai.azurecr.io/justiceapp:latest      
docker push  justiceai.azurecr.io/justiceapp:latest     


In JusticeAI.API

docker build -t justice-ai . --no-cache       
docker tag justice-ai  justiceaiapi.azurecr.io/justice-ai:latest    
docker push  justiceaiapi.azurecr.io/justice-ai:latest      