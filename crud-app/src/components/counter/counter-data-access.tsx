'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { getCrudProgram, getCrudProgramId } from '@project/anchor'

interface CreateEntryArgs {
  title: string,
  message: string,
  owner: PublicKey
}

export function useCrudProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCrudProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['crud', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createJournalEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['journalEntry', 'create', {cluster}],
    mutationFn: async({title, message, owner}) =>{
      return program.methods.createJournalEntry(title, message).rpc()
    },
    onSuccess: (signature)=>{
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error)=> {
      toast.error(`Error creating entry: ${error.message}`)
    }
  })

return {
  program,
  programId,
  accounts,
  getProgramAccount,
  createJournalEntry
}
  
}

export function useCrudProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudProgram()

  const accountQuery = useQuery({
    queryKey: ['crud', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })
  const updateJournalEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['journalEntry', 'update', {cluster}],
    mutationFn: async({title, message, owner}) =>{
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess: (signature)=>{
      transactionToast(signature);
      accounts.refetch()
    },
    onError: (error) =>{
      toast.error( `Error updation entry: ${error.message}`)
    }
  })

    const deleteJournalEntry = useMutation({
    mutationKey: ['journalEntry', 'delete', {cluster}],
    mutationFn: (title: string) =>{
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess: (signature)=>{
      transactionToast(signature);
      accounts.refetch()
    },
    onError: (error) =>{
      toast.error( `Error updation entry: ${error.message}`)
    }
  })



  return {
    accountQuery,
    updateJournalEntry,
    deleteJournalEntry
  }
}
 