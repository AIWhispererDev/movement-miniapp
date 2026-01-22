# Steps to deploy contract

## Step 1: Initialize Movement Project
```bash
movement init
```

Now you will have a movement address generated for you. Save this address - it will be your contract owner address.


## Step 2: Update Move.toml
Update the contract owner address in `Move.toml` in two places:
```toml
[addresses]
move_everything = "YOUR_CONTRACT_OWNER_ADDRESS"
me = "YOUR_CONTRACT_OWNER_ADDRESS"
```


## Step 3: Compile and Publish Contract
```bash
movement move compile
movement move publish
```


## Step 4: Initialize the Contract
```bash
movement move run --function-id 'YOUR_CONTRACT_ADDRESS::app_registry::initialize'
```


## Step 5: Add Owners
Add contract owners using the `add_owner` function:
```bash
movement move run --function-id 'YOUR_CONTRACT_ADDRESS::app_registry::add_owner' --args address:YOUR_CONTRACT_ADDRESS address:OWNER_ADDRESS_1
movement move run --function-id 'YOUR_CONTRACT_ADDRESS::app_registry::add_owner' --args address:YOUR_CONTRACT_ADDRESS address:OWNER_ADDRESS_2
```


* Replace `YOUR_CONTRACT_ADDRESS`, `OWNER_ADDRESS_1`, and `OWNER_ADDRESS_2` with the actual addresses.

