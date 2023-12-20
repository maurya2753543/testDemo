## Data Services API for ReportPRO

### PROJECTS
***
#### Get a list of projects 
GET api/v1/project/list

    Notes: This comes from the activedb database
    Should never fail, at minimum it should return an empty array

#### Get a project by name
GET api/v1/project/{name} 			- 

Errors:
	Name does not exist
	Problem reading the database (something is corrupted in the folder)

####Create a new project database given a name 
POST api/v1/project/

 **Body**
```
{ 
    "name" : "My new Project X"
}
```
Errors:
		Name is invalid – too long, illegal characters
		Name is not unique

#### Delete a project given a name
DELETE api/v1/project/{name}			- 

Errors:
		Name does not exist

#### Rename a project given current name & new name
PATCH	api/v1/project/{name}

		Errors:
			Name does not exist
			New name is not unique
			New name is invalid

### FOLDERS
***
#### Get a folder by id
GET api/v1/project/<project name>/folder/<id>

#### Create a new folder – given a id & parent._id
POST api/v1 /project/<project name>/folder

**Body**
```
{ 
    "name" : "Job-005",
    "parentId" : "d4042684-6dce-4ddb-8e81-6466f0454154"
}
```

#### Remove a folder document – given _id
DELETE api/v1/project/<project name>/folder/<id>

**Body**
```
{ 
    "name" : "My new folder",
    "parentId" : "d4042684-6dce-4ddb-8e81-6466f0454154",
    "_id" :  "2391a091-ad46-4d3f-8004-564a69760036",
    "_rev" : "1-d3dc5989306eec499e7c4a2c5dfb3411"
}
```

#### Rename a folder – given _id and new name    
PATCH api/v1/project/<project name>/folder/<id>

Body
new info in req body

### RESULTS
***
#### Get a result document
GET api/v1/project/<project name>/folder/<folder id>/results
```
{ 
    "name" : "My result",
    "parentId" : "d4042684-6dce-4ddb-8e81-6466f0454154",
    "status" : "pass",
    "type" : "otdr"
}
```
#### Add a result object – given a parent._id, filename, type, KPIs
POST api/v1/project/<project name>/folder/<folder id>/results

#### Delete a result document – given a result
DELETE api/v1/project/<project name>/folder/<folder id>/results

#### Rename
PATCH api/v1/project/<project name>/folder/<folder id>/results

	
### ATTACHMENTS
***
#### Get a list of attachments – given a result._id
GET api/v1/project/<project name>/result/{resultId}/attachments

#### Get a specific attachment – given a result.id, result.rev, attachment index
GET api/v1/project/<project name>/result/{resultId}/attachment/{index}

#### Add a new attachment – given a result._id, attachment type, and content
**Body**
```
{ 
    "name" : "My result",
    "parentId" : "d4042684-6dce-4ddb-8e81-6466f0454154",
    "status" : "pass",
    "type" : "otdr"
}
```
#### Remove an attachment – given a result._id, attachment index
DELETE api/v1/project/<project name>/result/{resultId}/attachment/{index}


