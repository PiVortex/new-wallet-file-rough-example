import { useState, useEffect, useContext } from 'react';

import { NearContext } from '@/context';
import styles from '@/styles/app.module.css';
import { HelloNearContract } from '../../config';
import { Cards } from '@/components/cards';

// Contract that the app will interact with
const CONTRACT = HelloNearContract;


export default function HelloNear() {
  const { signedAccountId, wallet } = useContext(NearContext);

  const [greeting, setGreeting] = useState('loading...');
  const [newGreeting, setNewGreeting] = useState('loading...');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!wallet) return;

    wallet.viewMethod({ contractId: CONTRACT, method: 'get_greeting' }).then(
      greeting => setGreeting(greeting)
    );
  }, [wallet]);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const saveGreeting = async () => {
    setShowSpinner(true);
    let res = await wallet.callMethod({ contractId: CONTRACT, method: 'set_greeting', args: { greeting: newGreeting } });
    console.log("the type is", typeof res);
    console.log("the res is", res);
    const greeting = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_greeting' });
    setGreeting(greeting);
    setShowSpinner(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Interacting with the contract: &nbsp;
          <code className={styles.code}>{CONTRACT}</code>
        </p>
      </div>

      <div>
        <button
          onClick={async () => {
            const balance = await wallet.getBalance(signedAccountId);
            console.log(typeof balance);
            setBalance(balance);
          }}
          style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}
        >
          Get Balance
        </button>
        <p>Balance: {balance} NEAR</p>
      </div>

      <div>
      <button
        onClick = {async () => {
          const res =  await wallet.signAndSendTransactions({
            transactions: [
              {
                receiverId: "guest-book.testnet",
                actions: [
                  {
                    type: "FunctionCall",
                    params: {
                      methodName: "addMessage",
                      args: { text: "Hello World!" },
                      gas: "30000000000000",
                      deposit: "10000000000000000000000",
                    },
                  },
                ],
              },
              {
                receiverId: "icespice.testnet",
                actions: [
                  {
                    type: "Transfer",
                    params: {
                      amount: "10000000000000000000000",
                    },
                  },
                ],
              }
            ],
          });
          console.log("the type is", typeof res);
          console.log("the res is", res);
        }}
        style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}
      >
        Send Transactions
      </button>
      </div>

      <div className={styles.center}>
        <h1 className="w-100">
          The contract says: <code>{greeting}</code>
        </h1>
        <div className="input-group" hidden={!loggedIn}>
          <input
            type="text"
            className="form-control w-20"
            placeholder="Store a new greeting"
            onChange={t => setNewGreeting(t.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-secondary" onClick={saveGreeting}>
              <span hidden={showSpinner}> Save </span>
              <i
                className="spinner-border spinner-border-sm"
                hidden={!showSpinner}
              ></i>
            </button>
          </div>
        </div>
        <div className="w-100 text-end align-text-center" hidden={loggedIn}>
          <p className="m-0"> Please login to change the greeting </p>
        </div>
      </div>
      <Cards />
    </main>
  );
}