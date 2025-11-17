import { useState, useEffect } from "react";
import {
  Button,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
  Text
} from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

/**
 * If you have a TS schema, keep the JSDoc; otherwise this is fine in JS.
 * @type {import('aws-amplify/data').Client}
 */
Amplify.configure(outputs);

const client = generateClient({ authMode: "userPool" });

export default function App() {
  const [userprofiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // You were already grabbing signOut—also grab the user
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      try {
        setLoading(true);
        setErr(null);

        // Try to get the user’s email (works for Cognito Hosted UI & most flows)
        const email =
          user?.signInDetails?.loginId ||
          user?.attributes?.email ||
          user?.username;

        // If you want *all* profiles, replace the list call with the simple one.
        const { data: profiles } = await client.models.UserProfile.list({
          filter: email ? { email: { eq: email } } : undefined,
        });

        if (isMounted) setUserProfiles(profiles ?? []);
      } catch (e) {
        if (isMounted) setErr(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserProfile();

    // --- Optional: live updates (uncomment if you want realtime) ---
    // const sub = client.models.UserProfile.observeQuery({
    //   filter: user?.attributes?.email
    //     ? { email: { eq: user.attributes.email } }
    //     : undefined,
    // }).subscribe({
    //   next({ items }) {
    //     if (isMounted) setUserProfiles(items ?? []);
    //   },
    //   error(e) {
    //     if (isMounted) setErr(e);
    //   },
    // });
    //
    // return () => {
    //   isMounted = false;
    //   sub?.unsubscribe?.();
    // };

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="70%"
      margin="0 auto"
      padding="2rem 0"
      gap="1rem"
    >
      <Heading level={1}>My Profile</Heading>
      <Divider />

      {loading && <Text>Loading your profile…</Text>}
      {err && (
        <Text color="red">
          {(err && (err.message || String(err))) || "Something went wrong"}
        </Text>
      )}

      {!loading && !err && userprofiles.length === 0 && (
        <Text>Raunak Upreti - raunakupretics@gmail.com</Text>
      )}

      <Grid
        margin="1rem 0 2rem"
        autoFlow="column"
        justifyContent="center"
        gap="2rem"
        alignContent="center"
      >
        {userprofiles.map((userprofile) => (
          <Flex
            key={userprofile.id ?? userprofile.email}
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap="0.75rem"
            border="1px solid #e5e7eb"
            padding="1.5rem"
            borderRadius="12px"
            className="box"
            minWidth="260px"
          >
            <View>
              <Heading level={3} as="h3">
                {userprofile.email ?? "No email"}
              </Heading>
              {/* Add more fields as needed, e.g.: */}
              {/* <Text>{userprofile.name}</Text> */}
            </View>
          </Flex>
        ))}
      </Grid>

      <Button onClick={signOut}>Sign Out</Button>
    </Flex>
  );
}
