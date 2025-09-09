import { requireUserId } from "~/common/services/auth.server";
import { GroupList } from "~/components/GroupList";
import type { Route } from "../+types/root";
import {
  getParticipatedGroup,
  getParticipatedGroupId,
} from "~/common/services/group.server";
import { useLoaderData } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);

  const groupList = await getParticipatedGroup(participatedGroupIdList);
  return { groupList };
}

export default function Home() {
  const groupList = useLoaderData<typeof loader>().groupList;
  return (
    <div>
      <GroupList groupList={groupList} />
    </div>
  );
}
