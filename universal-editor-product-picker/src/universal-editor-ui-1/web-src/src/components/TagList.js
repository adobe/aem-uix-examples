/*
 * <license header>
 */

import { useCallback, useEffect, useState } from "react";
import { TagGroup, Item as TagItem } from "@adobe/react-spectrum";

const TagList = ({ selections, setSelections }) => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const newTags = selections?.map((id) => {
      return { name: id, value: id };
    });

    setTags(newTags || []);
  }, [selections]);

  const onRemove = useCallback(
    (keys) => {
      setSelections(selections.filter((item) => !keys.has(item)));
    },
    [setSelections, selections]
  );

  return (
    <>
      {tags.length > 0 && (
        <TagGroup
          items={tags}
          label="Selected products:"
          aria-label="Selected products:"
          onRemove={onRemove}
          renderEmptyState={() => {}}
        >
          {(item) => (
            <TagItem key={item.value}>{item.name}</TagItem>
          )}
        </TagGroup>
      )}
    </>
  );
};

export { TagList };
