'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useCrudProgram, useCrudProgramAccount } from './counter-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useWallet } from '@solana/wallet-adapter-react'

export function CounterCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { createJournalEntry } = useCrudProgram()
  const {publicKey} = useWallet()

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = () =>{
    if (publicKey && isFormValid) {
      createJournalEntry.mutateAsync({title, message, owner: publicKey})
    }

    if(!publicKey) {
      return <p>Connect your wallet</p>
    }
  }

  return (
    <div>
      <input
        type='text' 
        placeholder='Title'
        value={title}
        onChange={(e)=> setTitle(e.target.value)}
        className='input input-bordered w-full max-w-xs'
      />

         <textarea
        placeholder='Message'
        value={message}
        onChange={(e)=> setMessage(e.target.value)}
        className='textarea textarea-bordered w-full max-w-xs'

      />
      <button
        onClick={handleSubmit}
        disabled={createJournalEntry.isPending || !isFormValid}
        className='btn btn-xs lg:btn-md btn-primary'
      >create</button>
    </div>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCrudProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateJournalEntry, deleteJournalEntry } = useCrudProgramAccount({
    account,
  })

  const {publicKey} = useWallet()

  const [message, setMessage] = useState('')

  const title = accountQuery.data?.title

  const isFormValid = message.trim() !== ''
  const handleSubmit = () =>{
    if (publicKey && isFormValid && title) {
      
      updateJournalEntry.mutateAsync({title, message, owner: publicKey})
      setMessage('')
    }

    if(!publicKey) {
      return <p>Connect your wallet</p>
    }
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle onClick={()=>accountQuery.refetch()}>Title: {accountQuery.data?.title}

         
        </CardTitle>
       
      </CardHeader>
      <CardContent>
         <p>{accountQuery.data?.message}</p>
        <div className="flex gap-4">
     <textarea
        placeholder='Message'
        value={message}
        onChange={(e)=> setMessage(e.target.value)}
        className='textarea textarea-bordered w-full max-w-xs'

      />
          <Button
            variant="outline"
            onClick={ handleSubmit}
            disabled={updateJournalEntry.isPending || !isFormValid}
          >
            Update
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const title= accountQuery.data?.title
              if(title){deleteJournalEntry.mutateAsync(title);}}
             
            }
            disabled={deleteJournalEntry.isPending }
          >
            Delete
          </Button>
      
        </div>
      </CardContent>
    </Card>
  )
}
