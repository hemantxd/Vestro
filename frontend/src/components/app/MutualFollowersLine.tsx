"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { followApi, type MutualFollowsResponse } from "@/lib/api/follow";

interface MutualFollowersLineProps {
  profileUserId: string;
}

/**
 * Instagram-style "Followed by X, Y and N others" line.
 * Hidden on your own profile and when there are no mutuals.
 */
export default function MutualFollowersLine({ profileUserId }: MutualFollowersLineProps) {
  const [data, setData] = useState<MutualFollowsResponse | null>(null);

  useEffect(() => {
    if (!profileUserId) return;
    let cancelled = false;
    followApi
      .getMutualFollows(profileUserId, 3)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Logged out / own profile / no mutuals — just hide the line.
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [profileUserId]);

  if (!data || data.total === 0 || data.mutuals.length === 0) return null;

  const shown = data.mutuals;
  const rest = data.total - shown.length;

  return (
    <p className="text-xs text-muted-2">
      Followed by{" "}
      {shown.map((u, i) => (
        <span key={u.id}>
          <Link
            href={`/profile/${u.username}`}
            className="font-semibold text-foreground hover:underline"
          >
            {u.displayName || u.username}
          </Link>
          {i < shown.length - 1 ? ", " : ""}
        </span>
      ))}
      {rest > 0 && (
        <>
          {" "}and{" "}
          <span className="font-semibold text-foreground">
            {rest} other{rest === 1 ? "" : "s"}
          </span>
        </>
      )}
    </p>
  );
}
