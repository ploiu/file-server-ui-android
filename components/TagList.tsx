import { TagApi } from '@/models';
import { FlatList, StyleSheet, Vibration } from 'react-native';
import { Button, Chip, MD3Colors, useTheme } from 'react-native-paper';
import Container from '@/components/Container';
import { useRef } from 'react';

export type TagListProps = {
  tags: TagApi[];
  onAdd: () => void;
  onDelete: (tag: string) => void;
};

export default function TagList(props: TagListProps) {
  const isDeleting = useRef(false);

  const triggerStartDeleting = (tag: string) => {
    isDeleting.current = true;
    const vibrationRamp: number[] = [
      // initial vibration to show interactability (ends on delay)
      50, 50, 50, 50, 250,
      // buzz the user has to go through to delete
      400, 25, 50,
    ];
    const waitTime = vibrationRamp.reduce((a, b) => a + b);
    Vibration.vibrate(vibrationRamp);
    setTimeout(() => {
      if (isDeleting.current) {
        props.onDelete(tag);
      }
    }, waitTime);
  };

  const triggerStopDeleting = () => {
    isDeleting.current = false;
    Vibration.cancel();
  };
  const theme = useTheme();
  return (
    <Container
      style={{
        borderRadius: theme.roundness,
        paddingBottom: 5,
      }}>
      <FlatList
        numColumns={2}
        columnWrapperStyle={{ marginBottom: 6 }}
        data={props.tags}
        renderItem={({ item }) => (
          <Chip
            style={styles.tag}
            icon={'tag'}
            testID={item.title}
            mode={'flat'}
            rippleColor={MD3Colors.secondary30}
            onPressIn={() => triggerStartDeleting(item.title)}
            onPressOut={triggerStopDeleting}>
            {item.title}
          </Chip>
        )}
      />
      <Button icon={'tag-plus'} onPress={props.onAdd}>
        Add Tag
      </Button>
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    marginLeft: 10,
  },
});
